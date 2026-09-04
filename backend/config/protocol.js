const PROTOCOL = {
  name: "ConfidentialPay",
  version: "0.9.4-orchestrator",
  privacy: {
    zkProvider: "ligero-arc",
    fheProvider: process.env.FHE_PROVIDER || "fhenix",
    proofTimeoutMs: 2000,
    selectiveDisclosureDefaultTtlSec: 3600,
  },
  fees: {
    minBps: 30,
    maxBps: 70,
    defaultBps: 45,
    enterpriseSaasTiers: [
      { id: "starter", monthly: 500 },
      { id: "growth", monthly: 1500 },
      { id: "enterprise", monthly: 5000 },
    ],
  },
  pipeline: {
    stages: [
      { id: 1, key: "source_deposit", label: "Source chain deposit" },
      { id: 2, key: "zk_proof", label: "ZK proof generation" },
      { id: 3, key: "stable_swap", label: "Swap to USDC" },
      { id: 4, key: "cctp_bridge", label: "CCTP cross-chain bridge" },
      { id: 5, key: "shielded_deposit", label: "Shielded pool deposit" },
      { id: 6, key: "private_transfer", label: "Private transfer" },
      { id: 7, key: "dest_withdraw", label: "Destination withdrawal" },
    ],
  },
  contracts: {
    ConfidentialPayroll: {
      ethereum: "0xC0ffeePay000000000000000000000000000001",
      base: "0xC0ffeePay000000000000000000000000000002",
      bnb: "0xC0ffeePay000000000000000000000000000003",
    },
    ShieldedPool: {
      ethereum: "0xSh1eldedP001000000000000000000000000001",
      base: "0xSh1eldedP001000000000000000000000000002",
    },
    CrossChainSettlement: {
      ethereum: "0xSett1eCCTP00000000000000000000000000001",
    },
    IncomeProver: {
      base: "0xInc0mePr0v0000000000000000000000000001",
    },
    ZKVerifier: {
      ethereum: "0xL1ger0Ver1fy00000000000000000000000001",
    },
  },
  compliance: {
    requireKyc: true,
    requireAml: true,
    auditModuleEnabled: true,
    taxDocuments: ["W-8BEN", "1099", "EU-equiv"],
  },
};

module.exports = { PROTOCOL };
