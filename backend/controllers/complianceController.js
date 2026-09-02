const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { complianceData, transactions } = require("../data/businessData");
const { screenParty, getScreen, listScreens } = require("../services/compliance/kycAmlScreen");
const { listAudit, proveDepositEqualsDistribution, appendAudit } = require("../services/compliance/auditTrail");
const { issueViewingKey } = require("../services/zk/selectiveDisclosure");
const {
  getComplianceScore,
  getComplianceStatus,
} = require("../services/compliance/kycKybService");

exports.getComplianceOverview = (req, res) => {
  const events = listAudit({ limit: 24 });
  const score = getComplianceScore();
  const status = getComplianceStatus();
  res.status(200).json({
    success: true,
    policyHealth: String(complianceData.policyHealth ?? "98%"),
    auditTrail: String(complianceData.auditTrail ?? events.length),
    openIssues: String(complianceData.openIssues ?? "0"),
    checks: Array.isArray(complianceData.checks) ? complianceData.checks : [],
    score,
    privacyScore: score.score,
    status,
    recentScreens: listScreens().slice(0, 10),
    auditEvents: events,
  });
};

exports.getComplianceScore = (req, res) => {
  res.status(200).json({ success: true, ...getComplianceScore() });
};

exports.getComplianceStatus = (req, res) => {
  res.status(200).json({ success: true, ...getComplianceStatus() });
};

exports.getComplianceAuditAlias = (req, res) => {
  const items = transactions.map((t) => ({
    ...t,
    audit: t.status === "completed" ? "pass" : "review",
  }));
  res.status(200).json({
    success: true,
    items,
    trail: listAudit({ limit: Number(req.query.limit) || 50 }),
  });
};

exports.screenParty = (req, res) => {
  const result = screenParty(req.body || {});
  appendAudit({ type: "aml_screen", screenId: result.screenId, status: result.status });
  res.status(201).json({ success: true, screen: result });
};

exports.getScreen = (req, res) => {
  const screen = getScreen(req.params.screenId);
  if (!screen) return res.status(404).json({ success: false, message: "Screen not found" });
  res.status(200).json({ success: true, screen });
};

exports.getAuditTrail = (req, res) => {
  res.status(200).json({ success: true, items: listAudit({ limit: Number(req.query.limit) || 50 }) });
};

exports.auditDeposits = (req, res) => {
  const proof = proveDepositEqualsDistribution(req.body || {});
  res.status(200).json({ success: true, proof });
};

exports.issueComplianceViewKey = (req, res) => {
  const key = issueViewingKey({ ...(req.body || {}), reason: req.body?.reason || "regulatory_disclosure" });
  res.status(201).json({ success: true, key });
};
