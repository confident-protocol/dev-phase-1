const express = require("express");
const ctrl = require("../controllers/zkController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext, requireZkHeaders } = require("../middlewares/protocol/privacyContext");
const { validateCircuitId, validatePagination } = require("../middlewares/validator");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext, requireZkHeaders];

router.get("/zk/circuits", ...base, ctrl.listCircuits);
router.post(
  "/zk/proofs",
  ...base,
  authorizeRoles("admin", "Owner", "operator", "Compliance"),
  validateCircuitId,
  idempotencyGuard,
  auditMutation("zk_proof"),
  ctrl.generateProof
);
router.get("/zk/proofs/:proofId", ...base, ctrl.getProof);
router.post(
  "/zk/proofs/verify",
  ...base,
  authorizeRoles("admin", "Owner", "operator", "Compliance"),
  auditMutation("zk_verify"),
  ctrl.verifyProof
);

router.post(
  "/zk/viewing-keys",
  ...base,
  authorizeRoles("admin", "Owner", "Compliance"),
  idempotencyGuard,
  auditMutation("viewing_key_issue"),
  ctrl.issueViewingKey
);
router.get("/zk/viewing-keys", ...base, validatePagination, ctrl.listViewingKeys);
router.delete(
  "/zk/viewing-keys/:keyId",
  ...base,
  authorizeRoles("admin", "Owner", "Compliance"),
  auditMutation("viewing_key_revoke"),
  ctrl.revokeViewingKey
);
router.get("/zk/viewing-keys/:keyId/resolve", ...base, ctrl.resolveDisclosure);

module.exports = router;
