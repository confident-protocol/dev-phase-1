const hits = new Map();

function softRateLimit({ windowMs = 60_000, max = 240, keyFn } = {}) {
  return (req, res, next) => {
    const key = (keyFn && keyFn(req)) || req.clientMeta?.ip || req.ip || "anon";
    const now = Date.now();
    const bucket = hits.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count += 1;
    hits.set(key, bucket);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    if (bucket.count > max) {
      return res.status(429).json({ success: false, message: "Rate limit exceeded (soft guard)" });
    }
    next();
  };
}

module.exports = { softRateLimit };
