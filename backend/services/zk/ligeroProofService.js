const crypto = require("crypto");
const { getCircuit, CIRCUIT_MANIFEST } = require("../../data/circuitManifest");
const { PROTOCOL } = require("../../config/protocol");

const proofStore = new Map();

function hashPayload(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function simulateProveLatency(circuit) {
  const base = circuit?.estimatedProveMs || 1200;
  return Math.min(PROTOCOL.privacy.proofTimeoutMs, base + Math.floor(Math.random() * 200));
}

async function generateProof(circuitId, witness, publicInputs = {}) {
  const circuit = getCircuit(circuitId);
  if (!circuit) {
    const err = new Error(`Unknown circuit: ${circuitId}`);
    err.statusCode = 400;
    throw err;
  }

  const latency = simulateProveLatency(circuit);
  await new Promise((r) => setTimeout(r, Math.min(latency, 15)));

  const proofId = `zk_${circuitId}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
  const commitment = hashPayload({ circuitId, witness, publicInputs });
  const proof = {
    proofId,
    circuitId,
    provider: PROTOCOL.privacy.zkProvider,
    status: "verified_local",
    createdAt: new Date().toISOString(),
    proveMs: latency,
    publicInputs,
    commitment,
    proofBytes: `0x${commitment.slice(0, 64)}`,
    nullifiers: Array.isArray(witness?.nullifiers) ? witness.nullifiers : [],
    meta: {
      maxBatchSize: circuit.maxBatchSize,
      purpose: circuit.purpose,
    },
  };

  proofStore.set(proofId, proof);
  return proof;
}

function getProof(proofId) {
  return proofStore.get(proofId) || null;
}

function listCircuits() {
  return CIRCUIT_MANIFEST;
}

function verifyProofLocal(proofId, expectedCommitment) {
  const proof = proofStore.get(proofId);
  if (!proof) return { valid: false, reason: "not_found" };
  if (expectedCommitment && proof.commitment !== expectedCommitment) {
    return { valid: false, reason: "commitment_mismatch" };
  }
  return { valid: true, proofId, circuitId: proof.circuitId, provider: proof.provider };
}

module.exports = {
  generateProof,
  getProof,
  listCircuits,
  verifyProofLocal,
  _proofStore: proofStore,
};
