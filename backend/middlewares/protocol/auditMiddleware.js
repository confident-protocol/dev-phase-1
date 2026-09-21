const { appendAudit } = require("../../services/compliance/auditTrail");

function auditRequest(eventType) {
  return (req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
      appendAudit({
        type: eventType || "http_request",
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        requestId: req.requestId,
        actor: req.user?.email || "anonymous",
        durationMs: Date.now() - started,
      });
    });
    next();
  };
}

function auditMutation(eventType) {
  return (req, res, next) => {
    req.auditEventType = eventType;
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      appendAudit({
        type: eventType,
        requestId: req.requestId,
        actor: req.user?.email || "anonymous",
        bodyKeys: Object.keys(req.body || {}),
        success: body?.success !== false,
      });
      return originalJson(body);
    };
    next();
  };
}

module.exports = { auditRequest, auditMutation };
