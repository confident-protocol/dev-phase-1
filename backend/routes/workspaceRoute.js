const express = require("express");
const ctrl = require("../controllers/workspaceController");
const { optionalAuth } = require("../middlewares/user_actions/auth");
const { attachWorkspace, requireWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { hasEmployeeRoster } = require("../middlewares/user_actions/userHas");
const { attachSupportedChains } = require("../middlewares/protocol/chainGuard");

const router = express.Router();

router.get(
  "/workspace",
  optionalAuth,
  attachWorkspace,
  requireWorkspace,
  attachPrivacyContext,
  attachSupportedChains,
  ctrl.getWorkspace
);

router.get(
  "/workspace/roster-summary",
  optionalAuth,
  attachWorkspace,
  hasEmployeeRoster,
  attachPrivacyContext,
  ctrl.getRosterSummary
);

module.exports = router;
