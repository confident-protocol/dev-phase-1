const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../services/payroll/templateService");

exports.list = asyncErrorHandler(async (req, res) => {
  res.status(200).json({ success: true, items: listTemplates() });
});

exports.getOne = asyncErrorHandler(async (req, res) => {
  const template = getTemplate(req.params.id);
  if (!template) return res.status(404).json({ success: false, message: "Template not found" });
  res.status(200).json({ success: true, template });
});

exports.create = asyncErrorHandler(async (req, res) => {
  res.status(201).json({ success: true, template: createTemplate(req.body || {}) });
});

exports.update = asyncErrorHandler(async (req, res) => {
  const template = updateTemplate(req.params.id, req.body || {});
  if (!template) return res.status(404).json({ success: false, message: "Template not found" });
  res.status(200).json({ success: true, template });
});

exports.remove = asyncErrorHandler(async (req, res) => {
  const ok = deleteTemplate(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: "Template not found" });
  res.status(200).json({ success: true, message: "Template deleted" });
});
