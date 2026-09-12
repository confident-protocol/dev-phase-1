const express = require("express");
const ctrl = require("../controllers/settlementController");
const { optionalAuth } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { attachSupportedChains } = require("../middlewares/protocol/chainGuard");
const { attachFeeContext } = require("../middlewares/protocol/feeGuard");
const { validatePagination } = require("../middlewares/validator");

const router = express.Router();

router.get(
  "/settlements/board",
  optionalAuth,
  attachWorkspace,
  attachPrivacyContext,
  attachSupportedChains,
  attachFeeContext,
  validatePagination,
  ctrl.getSettlementBoard
);

module.exports = router;
