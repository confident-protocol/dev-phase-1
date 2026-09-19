const express = require("express");
const ctrl = require("../controllers/contractController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { attachContractRegistry, validateContractName } = require("../middlewares/protocol/contractGuard");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { validatePagination } = require("../middlewares/validator");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext, attachContractRegistry];

router.get("/contracts", ...base, validatePagination, ctrl.listContracts);
router.get("/contracts/transactions/simulated", ...base, validatePagination, ctrl.listSimulatedTxs);
router.post(
  "/contracts/simulate",
  ...base,
  authorizeRoles("admin", "Owner", "operator"),
  validateContractName,
  idempotencyGuard,
  auditMutation("contract_simulate"),
  ctrl.simulateCall
);
router.get("/contracts/:name/abi", ...base, validateContractName, ctrl.getAbi);
router.get("/contracts/:name", ...base, validateContractName, ctrl.getContract);

module.exports = router;
