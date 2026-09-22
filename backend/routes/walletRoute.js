const express = require("express");
const ctrl = require("../controllers/walletController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { attachSupportedChains, resolveBodyChains } = require("../middlewares/protocol/chainGuard");
const { validateChainPair } = require("../middlewares/validator");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext, attachSupportedChains];

router.get("/wallets", ...base, ctrl.list);
router.post(
  "/wallets",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  resolveBodyChains,
  idempotencyGuard,
  auditMutation("wallet_register"),
  ctrl.register
);
router.post(
  "/wallets/:id/default",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  auditMutation("wallet_default"),
  ctrl.setDefault
);

module.exports = router;
