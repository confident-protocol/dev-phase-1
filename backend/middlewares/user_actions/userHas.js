/**
 * Mock capability checks — no Cart/Order/WishList mongoose models.
 */
const { transactions, employees } = require("../../data/businessData");

exports.hasActivePayroll = (req, res, next) => {
  req.userCapabilities = req.userCapabilities || {};
  req.userCapabilities.hasActivePayroll = transactions.some((t) => t.type === "payroll" && t.status === "completed");
  next();
};

exports.hasEmployeeRoster = (req, res, next) => {
  req.userCapabilities = req.userCapabilities || {};
  req.userCapabilities.employeeCount = employees.length;
  req.userCapabilities.hasEmployeeRoster = employees.length > 0;
  next();
};

exports.attachWishlistStub = (req, res, next) => {
  req.wishlist = [];
  next();
};

exports.attachCartStub = (req, res, next) => {
  req.cart = { items: [], protocolServices: [] };
  next();
};
