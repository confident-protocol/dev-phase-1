const express = require("express");
const ctrl = require("../controllers/fheController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { hasEmployeeRoster } = require("../middlewares/user_actions/userHas");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { validatePagination } = require("../middlewares/validator");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext];

router.post(
  "/fhe/encrypt-salary",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  idempotencyGuard,
  auditMutation("fhe_encrypt"),
  ctrl.encryptSalary
);
router.post(
  "/fhe/roster",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  idempotencyGuard,
  auditMutation("fhe_roster_upsert"),
  ctrl.upsertRosterLeaf
);
router.get("/fhe/roster", ...base, hasEmployeeRoster, validatePagination, ctrl.getRoster);
router.get("/fhe/roster/:employeeId", ...base, hasEmployeeRoster, ctrl.getEmployeeCipher);
router.post(
  "/fhe/income-proof",
  ...base,
  authorizeRoles("admin", "Owner", "operator", "Compliance"),
  idempotencyGuard,
  auditMutation("income_proof"),
  ctrl.requestIncomeProof
);
router.get("/fhe/income-proof/:requestId", ...base, ctrl.getIncomeProof);

module.exports = router;
