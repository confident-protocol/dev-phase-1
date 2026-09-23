const express = require("express");
const ctrl = require("../controllers/swapController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { attachSupportedChains } = require("../middlewares/protocol/chainGuard");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { attachFeeContext } = require("../middlewares/protocol/feeGuard");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext, attachSupportedChains, attachFeeContext];

router.post("/swap/quote", ...base, ctrl.quote);
router.get("/swap/quote", ...base, ctrl.quote);
router.post(
  "/swap/execute",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  idempotencyGuard,
  auditMutation("swap_execute"),
  ctrl.execute
);

module.exports = router;
