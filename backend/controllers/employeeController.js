const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  approveEmployee,
  bulkImport,
  ensureSeededRoster,
} = require("../services/employees/employeeDirectory");

exports.list = asyncErrorHandler(async (req, res) => {
  const items = listEmployees({
    status: req.query.status,
    chain: req.query.chain,
    q: req.query.q || req.query.search,
  });
  const merkle = ensureSeededRoster();
  res.status(200).json({
    success: true,
    items,
    encryptedRosterRoot: merkle.root,
    count: items.length,
  });
});

exports.getOne = asyncErrorHandler(async (req, res) => {
  const employee = getEmployee(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
  res.status(200).json({ success: true, employee });
});

exports.create = asyncErrorHandler(async (req, res) => {
  const employee = createEmployee(req.body || {});
  res.status(201).json({ success: true, employee });
});

exports.update = asyncErrorHandler(async (req, res) => {
  const employee = updateEmployee(req.params.id, req.body || {});
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
  res.status(200).json({ success: true, employee });
});

exports.remove = asyncErrorHandler(async (req, res) => {
  const ok = deleteEmployee(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: "Employee not found" });
  res.status(200).json({ success: true, message: "Employee removed from roster" });
});

exports.approve = asyncErrorHandler(async (req, res) => {
  const employee = approveEmployee(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
  res.status(200).json({ success: true, employee });
});

exports.bulkImport = asyncErrorHandler(async (req, res) => {
  const rows = Array.isArray(req.body?.employees) ? req.body.employees : req.body?.recipients || [];
  const items = bulkImport(rows);
  res.status(201).json({ success: true, imported: items.length, items });
});
