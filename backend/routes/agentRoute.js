const express = require("express");
const ctrl = require("../controllers/agentPayrollController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { validateChainPair, validatePagination } = require("../middlewares/validator");
const { resolveBodyChains } = require("../middlewares/protocol/chainGuard");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { notifyMiddleware } = require("../middlewares/helpers/createNotification");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext];

router.post(
  "/agents/payments",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  validateChainPair,
  resolveBodyChains,
  idempotencyGuard,
  auditMutation("agent_payment_enqueue"),
  notifyMiddleware((req) => ({
    title: "Agent payment queued",
    message: `Agent micropayment on ${req.body?.chain || "BASE"}`,
  })),
  ctrl.enqueue
);
router.post(
  "/agents/payments/:jobId/settle",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  auditMutation("agent_payment_settle"),
  ctrl.settle
);
router.get("/agents/payments", ...base, validatePagination, ctrl.list);

module.exports = router;
