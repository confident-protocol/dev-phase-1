/**
 * Request validators using mock catalogs — no mongoose ProductBrand/Category.
 */
const { services, employees } = require("../../data/businessData");
const { resolveChain } = require("../../config/chains");
const { getCircuit } = require("../../data/circuitManifest");

exports.validateServiceId = (req, res, next) => {
  const id = req.params.id;
  if (!id) return next();
  const found = services.find((s) => s.id === id);
  if (!found && String(id).startsWith("svc-")) {
    return res.status(404).json({ success: false, message: "Unknown protocol service id" });
  }
  req.validatedService = found || null;
  next();
};

exports.validateEmployeeIds = (req, res, next) => {
  const ids = req.body?.employeeIds;
  if (!ids) return next();
  if (!Array.isArray(ids)) {
    return res.status(400).json({ success: false, message: "employeeIds must be an array" });
  }
  const known = new Set(employees.map((e) => e.id));
  const unknown = ids.filter((id) => !known.has(id));
  if (unknown.length) {
    return res.status(400).json({ success: false, message: "Unknown employee ids", unknown });
  }
  next();
};

exports.validateChainPair = (req, res, next) => {
  const source = req.body?.sourceChain || req.query?.sourceChain;
  const dest = req.body?.destChain || req.query?.destChain;
  if (source && !resolveChain(source)) {
    return res.status(400).json({ success: false, message: `Unsupported source chain: ${source}` });
  }
  if (dest && !resolveChain(dest)) {
    return res.status(400).json({ success: false, message: `Unsupported destination chain: ${dest}` });
  }
  next();
};

exports.validateCircuitId = (req, res, next) => {
  const circuitId = req.body?.circuitId || req.params?.circuitId;
  if (!circuitId) return next();
  if (!getCircuit(circuitId)) {
    return res.status(400).json({ success: false, message: `Unknown circuit: ${circuitId}` });
  }
  next();
};

exports.validateLoginBody = (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  next();
};

exports.validatePagination = (req, res, next) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};
