const express = require("express");
const {
  processPayment,
  paytmResponse,
  getPaymentStatus,
  listSettlements,
} = require("../controllers/paymentController");
const { isAuthenticatedUser, optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { validatePagination } = require("../middlewares/validator");
const { softRateLimit } = require("../middlewares/common/rateLimitSoft");

const router = express.Router();
const authed = [isAuthenticatedUser, attachWorkspace, attachPrivacyContext];

router
  .route("/payment/process")
  .post(...authed, idempotencyGuard, auditMutation("settlement_process"), processPayment);
router
  .route("/business/payment/process")
  .post(...authed, idempotencyGuard, auditMutation("settlement_process"), processPayment);

router
  .route("/callback")
  .post(optionalAuth, softRateLimit({ max: 60 }), auditMutation("settlement_callback"), paytmResponse);
router
  .route("/business/callback")
  .post(optionalAuth, softRateLimit({ max: 60 }), auditMutation("settlement_callback"), paytmResponse);

router.route("/payment/status/:id").get(...authed, getPaymentStatus);
router.route("/business/payment/status/:id").get(...authed, getPaymentStatus);
router
  .route("/payment/settlements")
  .get(...authed, authorizeRoles("admin"), validatePagination, listSettlements);

module.exports = router;
