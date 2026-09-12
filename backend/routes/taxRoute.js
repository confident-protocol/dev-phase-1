const express = require("express");
const ctrl = require("../controllers/taxController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { validatePagination } = require("../middlewares/validator");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext];

router.post(
  "/tax/documents",
  ...base,
  authorizeRoles("admin", "Owner", "Compliance", "operator"),
  idempotencyGuard,
  auditMutation("tax_document_generate"),
  ctrl.generate
);
router.get("/tax/documents", ...base, validatePagination, ctrl.list);
router.get("/tax/documents/:id", ...base, ctrl.getOne);

module.exports = router;
