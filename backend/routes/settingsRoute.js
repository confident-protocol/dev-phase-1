const express = require("express");
const ctrl = require("../controllers/settingsController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace, requireWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { attachSupportedChains } = require("../middlewares/protocol/chainGuard");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, requireWorkspace, attachPrivacyContext];

router.get("/settings", ...base, attachSupportedChains, ctrl.getSettings);
router.put(
  "/settings",
  ...base,
  authorizeRoles("admin", "Owner", "Admin"),
  idempotencyGuard,
  auditMutation("settings_update"),
  ctrl.updateSettings
);
router.get("/settings/team", ...base, ctrl.getTeam);
router.post(
  "/settings/team",
  ...base,
  authorizeRoles("admin", "Owner", "Admin"),
  idempotencyGuard,
  auditMutation("team_invite"),
  ctrl.inviteTeamMember
);
router.get("/settings/saas-tiers", ...base, ctrl.getSaasTiers);

module.exports = router;
