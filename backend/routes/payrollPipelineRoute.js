const express = require("express");
const ctrl = require("../controllers/payrollPipelineController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const {
  requirePipelinePayload,
  attachPipelineDefaults,
  requirePipelineIdParam,
} = require("../middlewares/protocol/pipelineGuard");
const { validateEmployeeIds, validateChainPair, validatePagination } = require("../middlewares/validator");
const { resolveBodyChains, requireResolvedSourceChain } = require("../middlewares/protocol/chainGuard");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { hasEmployeeRoster } = require("../middlewares/user_actions/userHas");
const { notifyMiddleware } = require("../middlewares/helpers/createNotification");
const { parseBatchRecipients, requireBatchNotEmpty } = require("../middlewares/protocol/csvBatchGuard");
const { attachFeeContext, clampFeeBps } = require("../middlewares/protocol/feeGuard");

const router = express.Router();

const base = [optionalAuth, attachWorkspace, attachPrivacyContext, attachFeeContext];
const write = [
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  idempotencyGuard,
  attachPipelineDefaults,
  clampFeeBps,
  requirePipelinePayload,
  parseBatchRecipients,
  requireBatchNotEmpty,
  validateChainPair,
  resolveBodyChains,
  requireResolvedSourceChain,
];

router.post(
  "/pipeline/start",
  ...write,
  validateEmployeeIds,
  auditMutation("pipeline_start"),
  ctrl.startPipeline
);
router.post(
  "/pipeline/run",
  ...write,
  validateEmployeeIds,
  auditMutation("pipeline_run"),
  notifyMiddleware((req) => ({ title: "Pipeline run", message: `Full pipeline requested on ${req.body?.sourceChain}` })),
  ctrl.runFullPipeline
);
router.post(
  "/pipeline/:pipelineId/advance",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  requirePipelineIdParam,
  auditMutation("pipeline_advance"),
  ctrl.advancePipeline
);
router.get("/pipeline/:pipelineId", ...base, requirePipelineIdParam, ctrl.getPipeline);
router.get("/pipelines", ...base, validatePagination, ctrl.listPipelines);

router.post(
  "/payroll/execute",
  ...write,
  validateEmployeeIds,
  hasEmployeeRoster,
  auditMutation("payroll_execute"),
  notifyMiddleware(() => ({ title: "Payroll executed", message: "Confidential batch payroll submitted" })),
  ctrl.executePayroll
);
router.get("/payroll/runs", ...base, validatePagination, ctrl.listPayrollRuns);
router.get("/payroll/runs/:runId", ...base, ctrl.getPayrollRun);
router.get("/payroll/roster/encrypted", ...base, hasEmployeeRoster, ctrl.getEncryptedRoster);

router.post(
  "/payroll/delegations",
  ...write,
  validateEmployeeIds,
  auditMutation("delegation_create"),
  ctrl.createDelegation
);
router.get("/payroll/delegations", ...base, validatePagination, ctrl.listDelegations);
router.delete(
  "/payroll/delegations/:id",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  auditMutation("delegation_cancel"),
  ctrl.cancelDelegation
);

module.exports = router;
