const express = require("express");
const ctrl = require("../controllers/scheduleController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { validateEmployeeIds, validateChainPair, validatePagination } = require("../middlewares/validator");
const { resolveBodyChains } = require("../middlewares/protocol/chainGuard");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext];
const write = [
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  idempotencyGuard,
  validateChainPair,
  resolveBodyChains,
];

router.get("/payroll/scheduled", ...base, validatePagination, ctrl.list);
router.post(
  "/payroll/scheduled",
  ...write,
  validateEmployeeIds,
  auditMutation("schedule_create"),
  ctrl.create
);
router.post("/payroll/scheduled/:id/cancel", ...write, auditMutation("schedule_cancel"), ctrl.cancel);
router.delete("/payroll/scheduled/:id", ...write, auditMutation("schedule_delete"), ctrl.remove);

module.exports = router;
