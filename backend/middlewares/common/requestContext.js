const crypto = require("crypto");

function attachRequestId(req, res, next) {
  const incoming = req.headers["x-request-id"];
  req.requestId = typeof incoming === "string" && incoming ? incoming : `req_${crypto.randomBytes(6).toString("hex")}`;
  res.setHeader("X-Request-Id", req.requestId);
  next();
}

function attachClientMeta(req, res, next) {
  req.clientMeta = {
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "local",
    userAgent: req.headers["user-agent"] || "unknown",
    method: req.method,
    path: req.originalUrl || req.url,
  };
  next();
}

function attachTimestamp(req, res, next) {
  req.receivedAt = new Date().toISOString();
  req.startedAtMs = Date.now();
  next();
}

module.exports = { attachRequestId, attachClientMeta, attachTimestamp };
