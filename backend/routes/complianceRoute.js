const express = require("express");
const ctrl = require("../controllers/complianceController");
const kycCtrl = require("../controllers/kycController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { validatePagination } = require("../middlewares/validator");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext];

router.get("/compliance", ...base, validatePagination, ctrl.getComplianceOverview);
router.get("/compliance/score", ...base, kycCtrl.score);
router.get("/compliance/status", ...base, kycCtrl.status);
router.get("/compliance/kyb", ...base, kycCtrl.kyb);
router.get("/compliance/audit", ...base, validatePagination, ctrl.getComplianceAuditAlias);

router.post(
  "/compliance/kyc/:employeeId",
  ...base,
  authorizeRoles("admin", "Owner", "Compliance", "operator"),
  idempotencyGuard,
  auditMutation("kyc_submit"),
  kycCtrl.submitKyc
);
router.post(
  "/compliance/kyb/documents",
  ...base,
  authorizeRoles("admin", "Owner", "Compliance"),
  idempotencyGuard,
  auditMutation("kyb_document"),
  kycCtrl.submitKybDoc
);

router.post(
  "/compliance/screen",
  ...base,
  authorizeRoles("admin", "Owner", "Compliance", "operator"),
  idempotencyGuard,
  auditMutation("aml_screen"),
  ctrl.screenParty
);
router.get("/compliance/screen/:screenId", ...base, ctrl.getScreen);
router.post(
  "/compliance/audit/deposits",
  ...base,
  authorizeRoles("admin", "Owner", "Compliance"),
  auditMutation("deposit_audit"),
  ctrl.auditDeposits
);
router.post(
  "/compliance/viewing-key",
  ...base,
  authorizeRoles("admin", "Owner", "Compliance"),
  idempotencyGuard,
  auditMutation("compliance_view_key"),
  ctrl.issueComplianceViewKey
);

module.exports = router;
