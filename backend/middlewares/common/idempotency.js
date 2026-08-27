const cache = new Map();

function idempotencyGuard(req, res, next) {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();
  const key = req.headers["idempotency-key"] || req.headers["x-idempotency-key"];
  if (!key) return next();

  const cached = cache.get(String(key));
  if (cached) {
    res.setHeader("X-Idempotent-Replay", "true");
    return res.status(cached.status).json(cached.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    cache.set(String(key), { status: res.statusCode || 200, body, at: Date.now() });
    if (cache.size > 500) {
      const first = cache.keys().next().value;
      cache.delete(first);
    }
    return originalJson(body);
  };
  next();
}

module.exports = { idempotencyGuard };
