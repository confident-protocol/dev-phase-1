const CIRCUIT_MANIFEST = {
  version: "2024.05.ligero",
  circuits: [
    {
      id: "payroll_batch_v3",
      purpose: "Prove encrypted roster merkle inclusion + amount range without revealing salaries",
      publicInputs: ["rosterRoot", "nullifierSetHash", "feeBps", "chainDomain"],
      maxBatchSize: 512,
      estimatedProveMs: 1800,
    },
    {
      id: "shielded_deposit_v2",
      purpose: "Commitment binding for CCTP-minted USDC into shielded pool",
      publicInputs: ["commitment", "amountCommitment", "cctpAttestationHash"],
      maxBatchSize: 1,
      estimatedProveMs: 900,
    },
    {
      id: "private_transfer_v2",
      purpose: "Nullifier spend + new commitment for unlinkable recipient transfer",
      publicInputs: ["nullifier", "newCommitment", "merkleRoot"],
      maxBatchSize: 1,
      estimatedProveMs: 1100,
    },
    {
      id: "income_threshold_v1",
      purpose: "Prove salaryCipher >= thresholdCipher under FHE + ZK wrapper",
      publicInputs: ["requestId", "thresholdCommitment"],
      maxBatchSize: 1,
      estimatedProveMs: 1400,
    },
    {
      id: "compliance_view_v1",
      purpose: "Authorize selective disclosure viewing key without leaking plaintext on-chain",
      publicInputs: ["employeeIdHash", "viewerPubKeyHash", "expiresAt"],
      maxBatchSize: 32,
      estimatedProveMs: 700,
    },
  ],
};

function getCircuit(id) {
  return CIRCUIT_MANIFEST.circuits.find((c) => c.id === id) || null;
}

module.exports = { CIRCUIT_MANIFEST, getCircuit };
