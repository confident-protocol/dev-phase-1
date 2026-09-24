const express = require("express");
const ctrl = require("../controllers/bridgeController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { validateChainPair, validatePagination } = require("../middlewares/validator");
const { resolveBodyChains, attachSupportedChains } = require("../middlewares/protocol/chainGuard");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext, attachSupportedChains];

router.get("/bridge", ...base, ctrl.getBridgeOverview);
router.post(
  "/bridge/cctp/burn",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  validateChainPair,
  resolveBodyChains,
  idempotencyGuard,
  auditMutation("cctp_burn"),
  ctrl.startCctpTransfer
);
router.post(
  "/bridge/cctp/:burnId/attest",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  auditMutation("cctp_attest"),
  ctrl.attestCctp
);
router.post(
  "/bridge/cctp/mint",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  idempotencyGuard,
  auditMutation("cctp_mint"),
  ctrl.mintCctp
);
router.get("/bridge/cctp/burns", ...base, validatePagination, ctrl.listCctpBurns);
router.get("/bridge/cctp/burns/:burnId", ...base, ctrl.getCctpBurn);

router.post(
  "/bridge/hyperlane/dispatch",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  validateChainPair,
  resolveBodyChains,
  idempotencyGuard,
  auditMutation("hyperlane_dispatch"),
  ctrl.hyperlaneDispatch
);
router.post(
  "/bridge/hyperlane/:messageId/deliver",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  auditMutation("hyperlane_deliver"),
  ctrl.hyperlaneDeliver
);
router.get("/bridge/hyperlane", ...base, validatePagination, ctrl.listHyperlane);

module.exports = router;
