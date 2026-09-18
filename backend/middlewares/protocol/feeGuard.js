const { PROTOCOL } = require("../../config/protocol");

function attachFeeContext(req, res, next) {
  req.feeContext = {
    minBps: PROTOCOL.fees.minBps,
    maxBps: PROTOCOL.fees.maxBps,
    defaultBps: PROTOCOL.fees.defaultBps,
    appliedBps: req.body?.feeBps != null ? Number(req.body.feeBps) : PROTOCOL.fees.defaultBps,
  };
  next();
}

function clampFeeBps(req, res, next) {
  if (req.body && req.body.feeBps != null) {
    const bps = Number(req.body.feeBps);
    req.body.feeBps = Math.min(PROTOCOL.fees.maxBps, Math.max(PROTOCOL.fees.minBps, bps));
  }
  next();
}

module.exports = { attachFeeContext, clampFeeBps };
