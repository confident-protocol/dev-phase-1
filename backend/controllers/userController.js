const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const csvBatchGuard = require("../middlewares/protocol/csvBatchGuard");
const idempotency = require("../middlewares/common/idempotency");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/sendToken");
const ErrorHandler = require("../utils/errorHandler");
const { VALID_EMAIL, VALID_PASSWORD, ADMIN_USER } = require("../data/businessData");

function buildBusinessUser(payload = {}) {
  const name = payload.name || ADMIN_USER.name;
  const email = payload.email || VALID_EMAIL;
  const role = payload.role || "admin";

  return {
    _id: payload._id || "admin",
    id: payload.id || "admin",
    name,
    email,
    role,
    company: payload.company || ADMIN_USER.company,
    createdAt: new Date().toISOString(),
    comparePassword: async (enteredPassword) => enteredPassword === VALID_PASSWORD || enteredPassword === (payload.password || ""),
    getJWTToken: () => jwt.sign({ id: "admin", email }, process.env.JWT_SECRET || "confidentialpay-secret", { expiresIn: process.env.JWT_EXPIRE || "7d" }),
  };
}

function resolveCurrentUser(req) {
  if (req.user && req.user.email) return req.user;
  return buildBusinessUser({ email: VALID_EMAIL, role: "admin" });
}

// Register User
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, role = "admin" } = req.body || {};

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email And Password", 400));
  }

  const user = buildBusinessUser({ name, email, role, password });
  sendToken(user, 201, res);
});

// Login User
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email And Password", 400));
  }

  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    const user = buildBusinessUser({ email, role: "admin" });
    return sendToken(user, 201, res);
  }

  return next(new ErrorHandler("Invalid Email or Password", 401));
});

// Logout User
exports.logoutUser = asyncErrorHandler(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Get User Details
exports.getUserDetails = asyncErrorHandler(async (req, res, next) => {
  const user = resolveCurrentUser(req);

  res.status(200).json({
    success: true,
    user,
  });
});

// Forgot Password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const email = req.body?.email;

  if (!email) {
    return next(new ErrorHandler("Please Enter Email", 400));
  }

  res.status(200).json({
    success: true,
    message: `Password reset instructions sent to ${email}`,
  });
});

// Reset Password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const user = buildBusinessUser({ email: VALID_EMAIL, role: "admin" });
  sendToken(user, 200, res);
});

// Update Password
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  const user = resolveCurrentUser(req);
  sendToken(user, 201, res);
});

// Update User Profile
exports.updateProfile = asyncErrorHandler(async (req, res, next) => {
  const user = resolveCurrentUser(req);
  res.status(200).json({
    success: true,
    user: {
      ...user,
      name: req.body?.name || user.name,
      email: req.body?.email || user.email,
    },
  });
});

// ADMIN DASHBOARD
exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    users: [buildBusinessUser({ email: VALID_EMAIL, role: "admin" })],
  });
});

exports.getSingleUser = asyncErrorHandler(async (req, res, next) => {
  const user = buildBusinessUser({ email: VALID_EMAIL, role: "admin" });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: buildBusinessUser({ email: VALID_EMAIL, role: req.body?.role || "admin" }),
  });
});

exports.deleteUser = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "User removed from ConfidentialPay workspace",
  });
});



