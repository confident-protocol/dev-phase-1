const jwt = require("jsonwebtoken");
const ErrorHandler = require("../../utils/errorHandler");
const asyncErrorHandler = require("../helpers/asyncErrorHandler");
const { VALID_EMAIL, ADMIN_USER } = require("../../data/businessData");

function buildMockUser(overrides = {}) {
  return {
    _id: overrides.id || overrides._id || "admin",
    id: overrides.id || overrides._id || "admin",
    name: overrides.name || ADMIN_USER.name,
    email: overrides.email || ADMIN_USER.email,
    role: overrides.role || ADMIN_USER.role || "admin",
    company: overrides.company || ADMIN_USER.company,
  };
}

function decodeToken(token) {
  try {
    if (token.startsWith("mock-")) {
      return { id: "admin", email: VALID_EMAIL, role: "admin" };
    }
    return jwt.verify(token, process.env.JWT_SECRET || "confidentialpay-secret");
  } catch (_) {
    return null;
  }
}

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && String(authHeader).startsWith("Bearer ")) {
      token = String(authHeader).substring(7);
    }
  }

  if (!token) {
    return next(new ErrorHandler("Please Login to Access", 401));
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  req.user = buildMockUser(decoded);
  req.authToken = token;
  next();
});

exports.optionalAuth = asyncErrorHandler(async (req, res, next) => {
  let token = req.cookies?.token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!token && authHeader && String(authHeader).startsWith("Bearer ")) {
    token = String(authHeader).substring(7);
  }

  if (token) {
    const decoded = decodeToken(token);
    if (decoded) {
      req.user = buildMockUser(decoded);
      req.authToken = token;
    }
  }

  if (!req.user) {
    req.user = buildMockUser({ role: "admin" });
    req.demoAuth = true;
  }
  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Please Login to Access", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
    }
    next();
  };
};

exports.requireWorkspaceAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("Please Login to Access", 401));
  }
  if (!["admin", "Owner", "operator"].includes(req.user.role)) {
    return next(new ErrorHandler("Workspace admin role required", 403));
  }
  next();
};
