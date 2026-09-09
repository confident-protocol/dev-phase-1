const { resolveChain, listSupportedChains } = require("../../config/chains");

function attachSupportedChains(req, res, next) {
  req.supportedChains = listSupportedChains();
  next();
}

function resolveBodyChains(req, res, next) {
  const source = req.body?.sourceChain || req.query?.sourceChain;
  const dest = req.body?.destChain || req.query?.destChain;
  req.resolvedChains = {
    source: source ? resolveChain(source) : null,
    dest: dest ? resolveChain(dest) : null,
  };
  next();
}

function requireResolvedSourceChain(req, res, next) {
  if (req.body?.sourceChain && !req.resolvedChains?.source) {
    return res.status(400).json({ success: false, message: "Unable to resolve source chain" });
  }
  next();
}

module.exports = { attachSupportedChains, resolveBodyChains, requireResolvedSourceChain };
