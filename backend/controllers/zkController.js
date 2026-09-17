const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const privacyContext = require("../middlewares/protocol/privacyContext");
const chainGuard = require("../middlewares/protocol/chainGuard");
const contractGuard = require("../middlewares/protocol/contractGuard");
const feeGuard = require("../middlewares/protocol/feeGuard");
const csvBatchGuard = require("../middlewares/protocol/csvBatchGuard");
const idempotency = require("../middlewares/common/idempotency");
const { generateProof, getProof, listCircuits, verifyProofLocal } = require("../services/zk/ligeroProofService");
const {
  issueViewingKey,
  revokeViewingKey,
  resolveDisclosure,
  listActiveKeys,
} = require("../services/zk/selectiveDisclosure");
const { appendAudit } = require("../services/compliance/auditTrail");

exports.listCircuits = (req, res) => {
  res.status(200).json({ success: true, ...listCircuits() });
};

exports.generateProof = async (req, res, next) => {
  try {
    const { circuitId, witness, publicInputs } = req.body || {};
    if (!circuitId) return res.status(400).json({ success: false, message: "circuitId required" });
    const proof = await generateProof(circuitId, witness || {}, publicInputs || {});
    appendAudit({ type: "zk_proof_generated", proofId: proof.proofId, circuitId });
    res.status(201).json({ success: true, proof });
  } catch (err) {
    next(err);
  }
};

exports.getProof = (req, res) => {
  const proof = getProof(req.params.proofId);
  if (!proof) return res.status(404).json({ success: false, message: "Proof not found" });
  res.status(200).json({ success: true, proof });
};

exports.verifyProof = (req, res) => {
  const result = verifyProofLocal(req.body?.proofId, req.body?.commitment);
  res.status(200).json({ success: true, ...result });
};

exports.issueViewingKey = (req, res) => {
  const key = issueViewingKey(req.body || {});
  appendAudit({ type: "viewing_key_issued", keyId: key.keyId, employeeId: key.employeeId });
  res.status(201).json({ success: true, key });
};

exports.revokeViewingKey = (req, res) => {
  const key = revokeViewingKey(req.params.keyId);
  if (!key) return res.status(404).json({ success: false, message: "Key not found" });
  res.status(200).json({ success: true, key });
};

exports.resolveDisclosure = (req, res) => {
  res.status(200).json({ success: true, ...resolveDisclosure(req.params.keyId) });
};

exports.listViewingKeys = (req, res) => {
  res.status(200).json({ success: true, items: listActiveKeys() });
};
