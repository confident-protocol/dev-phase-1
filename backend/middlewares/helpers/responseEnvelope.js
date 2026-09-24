function successEnvelope(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === "object" && !Array.isArray(body) && body.success !== undefined) {
      return originalJson({
        ...body,
        meta: {
          requestId: req.requestId,
          receivedAt: req.receivedAt,
          workspace: req.workspace?.company,
          ...(body.meta || {}),
        },
      });
    }
    return originalJson(body);
  };
  next();
}

module.exports = { successEnvelope };
