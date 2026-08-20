const express = require("express");
const ctrl = require("../controllers/treasuryController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { attachSupportedChains, resolveBodyChains } = require("../middlewares/protocol/chainGuard");
const { validateChainPair, validatePagination } = require("../middlewares/validator");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { attachFeeContext } = require("../middlewares/protocol/feeGuard");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext, attachSupportedChains, attachFeeContext];

router.get("/treasury/balances", ...base, ctrl.getBalances);
router.get("/treasury/transactions", ...base, validatePagination, ctrl.getTreasuryTransactions);
router.post(
  "/treasury/deposit",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  idempotencyGuard,
  auditMutation("treasury_deposit"),
  ctrl.deposit
);
router.post(
  "/treasury/withdraw",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  idempotencyGuard,
  auditMutation("treasury_withdraw"),
  ctrl.withdraw
);
router.post(
  "/treasury/rebalance",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  validateChainPair,
  resolveBodyChains,
  idempotencyGuard,
  auditMutation("treasury_rebalance"),
  ctrl.rebalance
);

module.exports = router;
