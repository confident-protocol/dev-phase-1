const express = require("express");
const {
  login,
  signup,
  me,
  dashboard,
  payrollHistory,
} = require("../controllers/businessController");
const { executePayroll } = require("../controllers/payrollPipelineController");
const employeeCtrl = require("../controllers/employeeController");
const templateCtrl = require("../controllers/templateController");
const scheduleCtrl = require("../controllers/scheduleController");
const settingsCtrl = require("../controllers/settingsController");
const treasuryCtrl = require("../controllers/treasuryController");
const complianceCtrl = require("../controllers/complianceController");
const kycCtrl = require("../controllers/kycController");
const bridgeCtrl = require("../controllers/bridgeController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace, requireWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const {
  validateLoginBody,
  validateEmployeeIds,
  validateChainPair,
  validatePagination,
} = require("../middlewares/validator");
const { hasEmployeeRoster, hasActivePayroll } = require("../middlewares/user_actions/userHas");
const {
  attachPipelineDefaults,
  requirePipelinePayload,
} = require("../middlewares/protocol/pipelineGuard");
const { resolveBodyChains, attachSupportedChains } = require("../middlewares/protocol/chainGuard");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation, auditRequest } = require("../middlewares/protocol/auditMiddleware");
const { softRateLimit } = require("../middlewares/common/rateLimitSoft");
const { notifyMiddleware } = require("../middlewares/helpers/createNotification");
const { attachFeeContext, clampFeeBps } = require("../middlewares/protocol/feeGuard");
const { parseBatchRecipients } = require("../middlewares/protocol/csvBatchGuard");

const router = express.Router();
const base = [
  optionalAuth,
  attachWorkspace,
  requireWorkspace,
  attachPrivacyContext,
  softRateLimit({ max: 320 }),
];

router.post(
  "/auth/login",
  validateLoginBody,
  softRateLimit({ max: 40, windowMs: 60_000 }),
  auditMutation("auth_login"),
  login
);
router.post(
  "/auth/signup",
  validateLoginBody,
  softRateLimit({ max: 30 }),
  idempotencyGuard,
  auditMutation("auth_signup"),
  signup
);
router.get("/auth/me", ...base, me);
router.post(
  "/auth/forgot-password",
  softRateLimit({ max: 20 }),
  auditMutation("auth_forgot"),
  (req, res) => {
    res.status(200).json({ success: true, message: "Password reset link is ready for demo mode." });
  }
);

router.get("/dashboard/stats", ...base, hasActivePayroll, dashboard.stats);
router.get("/dashboard/transactions", ...base, validatePagination, dashboard.transactions);
router.get("/dashboard/payroll-activity", ...base, dashboard.activity);
router.get("/dashboard/upcoming-payrolls", ...base, dashboard.upcoming);

router.get("/payroll/employees", ...base, hasEmployeeRoster, validatePagination, employeeCtrl.list);
router.get("/employees", ...base, hasEmployeeRoster, validatePagination, employeeCtrl.list);
router.post(
  "/payroll/execute",
  ...base,
  authorizeRoles("admin", "Owner", "operator", "Admin"),
  attachFeeContext,
  attachPipelineDefaults,
  clampFeeBps,
  requirePipelinePayload,
  parseBatchRecipients,
  validateEmployeeIds,
  validateChainPair,
  resolveBodyChains,
  idempotencyGuard,
  auditMutation("payroll_execute"),
  notifyMiddleware(() => ({
    title: "Payroll executed",
    message: "MVP confidential payroll batch submitted",
  })),
  executePayroll
);
router.get("/payroll/scheduled", ...base, validatePagination, scheduleCtrl.list);
router.get("/payroll/history", ...base, validatePagination, hasActivePayroll, payrollHistory);
router.get("/payroll/templates", ...base, validatePagination, templateCtrl.list);

router.get("/treasury/balances", ...base, attachSupportedChains, treasuryCtrl.getBalances);
router.get("/treasury/transactions", ...base, validatePagination, treasuryCtrl.getTreasuryTransactions);
router.post(
  "/treasury/rebalance",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  validateChainPair,
  resolveBodyChains,
  idempotencyGuard,
  auditMutation("treasury_rebalance"),
  treasuryCtrl.rebalance
);

router.get("/compliance", ...base, auditRequest("compliance_view"), complianceCtrl.getComplianceOverview);
router.get("/compliance/score", ...base, kycCtrl.score);
router.get("/compliance/status", ...base, kycCtrl.status);
router.get("/compliance/audit", ...base, validatePagination, complianceCtrl.getComplianceAuditAlias);

router.get("/bridge", ...base, attachSupportedChains, bridgeCtrl.getBridgeOverview);
router.get("/settings", ...base, attachSupportedChains, settingsCtrl.getSettings);
router.get("/settings/team", ...base, settingsCtrl.getTeam);

module.exports = router;
