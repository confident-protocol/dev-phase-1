const express = require("express");
const ctrl = require("../controllers/notificationController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { validatePagination } = require("../middlewares/validator");

const router = express.Router();

router.get(
  "/notifications",
  optionalAuth,
  attachWorkspace,
  attachPrivacyContext,
  validatePagination,
  ctrl.listMine
);

router.post(
  "/notifications",
  optionalAuth,
  authorizeRoles("admin", "Owner", "operator"),
  attachWorkspace,
  auditMutation("notification_create"),
  ctrl.create
);

module.exports = router;
