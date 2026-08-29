const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const crypto = require("crypto");
const { transactions } = require("../data/businessData");
const { PROTOCOL } = require("../config/protocol");

const settlementLedger = [];

function feeFor(amount) {
  const bps = PROTOCOL.fees.defaultBps;
  return Number(((Number(amount) || 0) * bps) / 10_000).toFixed(6);
}

exports.processPayment = asyncErrorHandler(async (req, res) => {
  const amount = Number(req.body?.amount) || 0;
  const record = {
    id: `settle_${crypto.randomBytes(4).toString("hex")}`,
    type: req.body?.type || "treasury_transfer",
    amount,
    fee: Number(feeFor(amount)),
    chain: req.body?.chain || req.workspace?.defaultChain || "BNB",
    status: "processing",
    privacy: req.privacy || null,
    createdAt: new Date().toISOString(),
  };
  settlementLedger.unshift(record);
  res.status(201).json({ success: true, payment: record });
});

exports.paytmResponse = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Legacy callback accepted as mock settlement webhook",
    payload: req.body || {},
  });
});

exports.getPaymentStatus = asyncErrorHandler(async (req, res) => {
  const found =
    settlementLedger.find((p) => p.id === req.params.id) ||
    transactions.find((t) => t.id === req.params.id);

  if (!found) {
    return res.status(404).json({ success: false, message: "Settlement not found" });
  }

  res.status(200).json({ success: true, payment: { ...found, status: found.status || "completed" } });
});

exports.listSettlements = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    items: [...settlementLedger, ...transactions].slice(0, req.pagination?.limit || 25),
  });
});
