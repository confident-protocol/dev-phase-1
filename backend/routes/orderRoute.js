const express = require("express");
const {
  newOrder,
  getSingleOrderDetails,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  optionalAuth,
} = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { validateChainPair, validatePagination } = require("../middlewares/validator");
const { hasActivePayroll } = require("../middlewares/user_actions/userHas");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { resolveBodyChains } = require("../middlewares/protocol/chainGuard");

const router = express.Router();
const authed = [isAuthenticatedUser, attachWorkspace, attachPrivacyContext];

router
  .route("/order/new")
  .post(
    ...authed,
    validateChainPair,
    resolveBodyChains,
    idempotencyGuard,
    auditMutation("payroll_order_create"),
    newOrder
  );
router.route("/order/:id").get(...authed, getSingleOrderDetails);
router.route("/orders/me").get(...authed, hasActivePayroll, validatePagination, myOrders);
router
  .route("/business/orders/new")
  .post(
    ...authed,
    validateChainPair,
    resolveBodyChains,
    idempotencyGuard,
    auditMutation("payroll_order_create"),
    newOrder
  );
router.route("/business/orders/:id").get(...authed, getSingleOrderDetails);
router.route("/business/orders/me").get(...authed, hasActivePayroll, myOrders);

router
  .route("/admin/orders")
  .get(...authed, authorizeRoles("admin"), validatePagination, getAllOrders);

router
  .route("/admin/order/:id")
  .put(...authed, authorizeRoles("admin"), auditMutation("payroll_order_update"), updateOrder)
  .delete(...authed, authorizeRoles("admin"), auditMutation("payroll_order_delete"), deleteOrder);

module.exports = router;
