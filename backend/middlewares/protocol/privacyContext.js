const { PROTOCOL } = require("../../config/protocol");

function attachPrivacyContext(req, res, next) {
  req.privacy = {
    zkProvider: PROTOCOL.privacy.zkProvider,
    fheProvider: PROTOCOL.privacy.fheProvider,
    proofTimeoutMs: PROTOCOL.privacy.proofTimeoutMs,
    selectiveDisclosureDefaultTtlSec: PROTOCOL.privacy.selectiveDisclosureDefaultTtlSec,
  };
  res.setHeader("X-CP-ZK", PROTOCOL.privacy.zkProvider);
  res.setHeader("X-CP-FHE", PROTOCOL.privacy.fheProvider);
  next();
}

function requireZkHeaders(req, res, next) {
  // Soft requirement: demo clients may omit; we still attach defaults.
  req.zkClientHint = req.headers["x-zk-client"] || "orchestrator-local";
  next();
}

module.exports = { attachPrivacyContext, requireZkHeaders };
