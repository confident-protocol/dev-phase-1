function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    if (process.env.NODE_ENV !== "test") {
      console.log(
        `[CP] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${ms}ms id=${req.requestId || "-"}`
      );
    }
  });
  next();
}

function slowRequestFlag(thresholdMs = 1500) {
  return (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      if (ms >= thresholdMs) {
        console.warn(`[CP][SLOW] ${req.method} ${req.originalUrl} took ${ms}ms`);
      }
    });
    next();
  };
}

module.exports = { requestLogger, slowRequestFlag };
