const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const auth = require("../middlewares/user_actions/auth");
const {
  getKybStatus,
  getComplianceStatus,
  getComplianceScore,
  submitEmployeeKyc,
  submitKybDocument,
} = require("../services/compliance/kycKybService");
const { appendAudit } = require("../services/compliance/auditTrail");

exports.score = asyncErrorHandler(async (req, res) => {
  res.status(200).json({ success: true, ...getComplianceScore() });
});

exports.status = asyncErrorHandler(async (req, res) => {
  res.status(200).json({ success: true, ...getComplianceStatus() });
});

exports.kyb = asyncErrorHandler(async (req, res) => {
  res.status(200).json({ success: true, ...getKybStatus() });
});

exports.submitKyc = asyncErrorHandler(async (req, res) => {
  const employeeId = req.params.employeeId || req.body?.employeeId;
  if (!employeeId) return res.status(400).json({ success: false, message: "employeeId required" });
  const record = submitEmployeeKyc(employeeId, req.body || {});
  appendAudit({ type: "kyc_submit", employeeId, status: record.status });
  res.status(201).json({ success: true, kyc: record });
});

exports.submitKybDoc = asyncErrorHandler(async (req, res) => {
  const doc = submitKybDocument(req.body?.type);
  appendAudit({ type: "kyb_document", documentId: doc.id });
  res.status(201).json({ success: true, document: doc });
});
