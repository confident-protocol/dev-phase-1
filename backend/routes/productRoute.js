const express = require("express");
const {
  getAllProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
  getProductReviews,
  deleteReview,
  createProductReview,
  createProduct,
  getAdminProducts,
  getProducts,
} = require("../controllers/productController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  optionalAuth,
} = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { validateServiceId, validatePagination } = require("../middlewares/validator");
const getRatingInfo = require("../middlewares/user_actions/getRatingInfo");
const { attachCartStub } = require("../middlewares/user_actions/userHas");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { idempotencyGuard } = require("../middlewares/common/idempotency");

const router = express.Router();
const publicRead = [optionalAuth, attachWorkspace, attachPrivacyContext];
const adminWrite = [
  isAuthenticatedUser,
  authorizeRoles("admin"),
  attachWorkspace,
  attachPrivacyContext,
  idempotencyGuard,
];

router.route("/products").get(...publicRead, validatePagination, attachCartStub, getAllProducts);
router.route("/products/all").get(...publicRead, getProducts);
router.route("/business/products").get(...publicRead, getProducts);
router.route("/business/product/:id").get(...publicRead, validateServiceId, getRatingInfo, getProductDetails);

router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), attachWorkspace, attachPrivacyContext, getAdminProducts);
router
  .route("/admin/product/new")
  .post(...adminWrite, auditMutation("service_create"), createProduct);

router
  .route("/admin/product/:id")
  .put(...adminWrite, validateServiceId, auditMutation("service_update"), updateProduct)
  .delete(...adminWrite, validateServiceId, auditMutation("service_delete"), deleteProduct);

router.route("/product/:id").get(...publicRead, validateServiceId, getRatingInfo, getProductDetails);

router
  .route("/review")
  .put(isAuthenticatedUser, attachWorkspace, attachPrivacyContext, auditMutation("service_review"), createProductReview);

router
  .route("/admin/reviews")
  .get(optionalAuth, attachWorkspace, attachPrivacyContext, getProductReviews)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), attachWorkspace, auditMutation("review_delete"), deleteReview);

module.exports = router;
