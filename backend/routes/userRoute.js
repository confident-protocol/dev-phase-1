const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserDetails,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  optionalAuth,
} = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { validateLoginBody, validatePagination } = require("../middlewares/validator");
const { softRateLimit } = require("../middlewares/common/rateLimitSoft");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { idempotencyGuard } = require("../middlewares/common/idempotency");

const router = express.Router();
const authed = [isAuthenticatedUser, attachWorkspace, attachPrivacyContext];

router.route("/register").post(
  validateLoginBody,
  softRateLimit({ max: 30 }),
  idempotencyGuard,
  auditMutation("user_register"),
  registerUser
);
router.route("/login").post(
  validateLoginBody,
  softRateLimit({ max: 40 }),
  auditMutation("user_login"),
  loginUser
);
router.route("/logout").get(optionalAuth, attachWorkspace, logoutUser);
router.route("/me").get(...authed, getUserDetails);
router.route("/password/forgot").post(softRateLimit({ max: 20 }), auditMutation("forgot_password"), forgotPassword);
router.route("/password/reset/:token").put(softRateLimit({ max: 20 }), auditMutation("reset_password"), resetPassword);
router.route("/password/update").put(...authed, auditMutation("update_password"), updatePassword);
router.route("/me/update").put(...authed, idempotencyGuard, auditMutation("update_profile"), updateProfile);

router.route("/auth/register").post(
  validateLoginBody,
  softRateLimit({ max: 30 }),
  idempotencyGuard,
  auditMutation("user_register"),
  registerUser
);
router.route("/auth/login").post(
  validateLoginBody,
  softRateLimit({ max: 40 }),
  auditMutation("user_login"),
  loginUser
);
router.route("/auth/logout").get(optionalAuth, attachWorkspace, logoutUser);
router.route("/auth/me").get(...authed, getUserDetails);
router.route("/auth/forgot-password").post(softRateLimit({ max: 20 }), auditMutation("forgot_password"), forgotPassword);
router.route("/auth/password/reset/:token").put(softRateLimit({ max: 20 }), auditMutation("reset_password"), resetPassword);
router.route("/auth/password/update").put(...authed, auditMutation("update_password"), updatePassword);
router.route("/auth/me/update").put(...authed, idempotencyGuard, auditMutation("update_profile"), updateProfile);

router
  .route("/admin/users")
  .get(...authed, authorizeRoles("admin"), validatePagination, getAllUsers);

router
  .route("/admin/user/:id")
  .get(...authed, authorizeRoles("admin"), getSingleUser)
  .put(...authed, authorizeRoles("admin"), auditMutation("update_user_role"), updateUserRole)
  .delete(...authed, authorizeRoles("admin"), auditMutation("delete_user"), deleteUser);

module.exports = router;
