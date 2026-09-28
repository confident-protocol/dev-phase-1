const { CIRCUIT_MANIFEST, getCircuit } = require("../../data/circuitManifest");

function describeCircuitGraph() {
  return {
    version: CIRCUIT_MANIFEST.version,
    nodes: CIRCUIT_MANIFEST.circuits.map((c) => ({
      id: c.id,
      purpose: c.purpose,
      edges: inferEdges(c.id),
    })),
  };
}

function inferEdges(circuitId) {
  switch (circuitId) {
    case "payroll_batch_v3":
      return ["shielded_deposit_v2", "compliance_view_v1"];
    case "shielded_deposit_v2":
      return ["private_transfer_v2"];
    case "private_transfer_v2":
      return [];
    case "income_threshold_v1":
      return ["compliance_view_v1"];
    default:
      return [];
  }
}

function assertCircuitSupportsBatch(circuitId, batchSize) {
  const circuit = getCircuit(circuitId);
  if (!circuit) return { ok: false, reason: "unknown_circuit" };
  if (batchSize > circuit.maxBatchSize) {
    return { ok: false, reason: "batch_too_large", maxBatchSize: circuit.maxBatchSize };
  }
  return { ok: true, circuit };
}

module.exports = { describeCircuitGraph, assertCircuitSupportsBatch, inferEdges };
