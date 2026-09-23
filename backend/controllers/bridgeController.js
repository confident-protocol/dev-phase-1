const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const contractGuard = require("../middlewares/protocol/contractGuard");
const feeGuard = require("../middlewares/protocol/feeGuard");
const {
  initiateBurn,
  attachAttestation,
  mintOnDestination,
  getBurn,
  listBurns,
} = require("../services/bridge/cctpBridgeService");
const { dispatchStateSync, markDelivered, listDispatches } = require("../services/bridge/hyperlaneRelayer");
const { bridgeData } = require("../data/businessData");
const { appendAudit } = require("../services/compliance/auditTrail");

exports.getBridgeOverview = (req, res) => {
  res.status(200).json({
    success: true,
    ...bridgeData,
    cctpBurns: listBurns().slice(0, 10),
    hyperlane: listDispatches().slice(0, 10),
  });
};

exports.startCctpTransfer = (req, res, next) => {
  try {
    const burn = initiateBurn(req.body || {});
    appendAudit({ type: "cctp_burn", burnId: burn.burnId, amount: burn.amount });
    res.status(201).json({ success: true, burn });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
};

exports.attestCctp = (req, res) => {
  const result = attachAttestation(req.params.burnId);
  if (!result) return res.status(404).json({ success: false, message: "Burn not found" });
  res.status(200).json({ success: true, ...result });
};

exports.mintCctp = (req, res) => {
  const result = mintOnDestination(req.body?.attestationHash, req.body?.recipient);
  if (!result) return res.status(404).json({ success: false, message: "Attestation not found" });
  res.status(200).json({ success: true, ...result });
};

exports.getCctpBurn = (req, res) => {
  const burn = getBurn(req.params.burnId);
  if (!burn) return res.status(404).json({ success: false, message: "Burn not found" });
  res.status(200).json({ success: true, burn });
};

exports.listCctpBurns = (req, res) => {
  res.status(200).json({ success: true, items: listBurns() });
};

exports.hyperlaneDispatch = (req, res, next) => {
  try {
    const message = dispatchStateSync(req.body || {});
    res.status(201).json({ success: true, message });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
};

exports.hyperlaneDeliver = (req, res) => {
  const message = markDelivered(req.params.messageId);
  if (!message) return res.status(404).json({ success: false, message: "Message not found" });
  res.status(200).json({ success: true, message });
};

exports.listHyperlane = (req, res) => {
  res.status(200).json({ success: true, items: listDispatches() });
};
