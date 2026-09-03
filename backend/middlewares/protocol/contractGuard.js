const { PROTOCOL } = require("../../config/protocol");

function attachContractRegistry(req, res, next) {
  req.contractRegistry = PROTOCOL.contracts;
  next();
}

function validateContractName(req, res, next) {
  const name = req.params.name || req.body?.name;
  if (!name) return next();
  if (!PROTOCOL.contracts[name]) {
    return res.status(404).json({ success: false, message: `Unknown contract: ${name}` });
  }
  next();
}

module.exports = { attachContractRegistry, validateContractName };
