const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { getAggregatedTreasury, simulateRebalance } = require("../services/treasury/multiChainBalance");
const { deposit, withdraw } = require("../services/treasury/depositWithdraw");
const { transactions } = require("../data/businessData");
const { appendAudit } = require("../services/compliance/auditTrail");

exports.getBalances = (req, res) => {
  res.status(200).json({ success: true, ...getAggregatedTreasury() });
};

exports.getTreasuryTransactions = (req, res) => {
  res.status(200).json({ success: true, items: transactions });
};

exports.rebalance = (req, res) => {
  const plan = simulateRebalance(req.body || {});
  appendAudit({ type: "treasury_rebalance", ...plan });
  res.status(201).json({ success: true, plan });
};

exports.deposit = (req, res) => {
  const result = deposit(req.body || {});
  appendAudit({ type: "treasury_deposit", amount: req.body?.amount, chain: req.body?.chain });
  res.status(201).json({ success: true, ...result });
};

exports.withdraw = (req, res, next) => {
  try {
    const result = withdraw(req.body || {});
    appendAudit({ type: "treasury_withdraw", amount: req.body?.amount, chain: req.body?.chain });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
};
