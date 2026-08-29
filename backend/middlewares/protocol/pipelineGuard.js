const { PROTOCOL } = require("../../config/protocol");

function requirePipelinePayload(req, res, next) {
  const body = req.body || {};
  if (body.amount != null && !(Number(body.amount) >= 0)) {
    return res.status(400).json({ success: false, message: "Invalid payroll amount" });
  }
  if (body.feeBps != null) {
    const bps = Number(body.feeBps);
    if (bps < PROTOCOL.fees.minBps || bps > PROTOCOL.fees.maxBps) {
      return res.status(400).json({
        success: false,
        message: `feeBps must be between ${PROTOCOL.fees.minBps} and ${PROTOCOL.fees.maxBps}`,
      });
    }
  }
  return next();
}

function attachProtocolHeaders(_req, res, next) {
  res.setHeader("X-ConfidentialPay-Version", PROTOCOL.version);
  res.setHeader(
    "X-ConfidentialPay-Privacy",
    `${PROTOCOL.privacy.zkProvider}+${PROTOCOL.privacy.fheProvider}`
  );
  next();
}

function attachPipelineDefaults(req, res, next) {
  req.body = req.body || {};
  // Frontend PayrollPage sends { chain, privacy, employeeIds }
  if (!req.body.sourceChain && req.body.chain) req.body.sourceChain = req.body.chain;
  if (!req.body.sourceChain) req.body.sourceChain = "BNB";
  if (!req.body.destChain) {
    req.body.destChain = req.body.sourceChain === "ETH" ? "BASE" : "ETH";
  }
  if (req.body.feeBps == null) req.body.feeBps = PROTOCOL.fees.defaultBps;
  if (req.body.privacy) {
    req.privacyMode = req.body.privacy;
  }
  next();
}

function requirePipelineIdParam(req, res, next) {
  if (!req.params.pipelineId) {
    return res.status(400).json({ success: false, message: "pipelineId required" });
  }
  next();
}

module.exports = {
  requirePipelinePayload,
  attachProtocolHeaders,
  attachPipelineDefaults,
  requirePipelineIdParam,
};
