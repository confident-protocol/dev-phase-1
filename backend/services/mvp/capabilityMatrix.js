const { PROTOCOL } = require("../../config/protocol");
const { listSupportedChains } = require("../../config/chains");

/**
 * ConfidentialPay MVP capability matrix (whitepaper §6.1 + §3.4).
 * Tracks what the orchestrator exposes for MVP build-out.
 */
function getMvpCapabilities() {
  const chains = listSupportedChains();
  return {
    product: PROTOCOL.name,
    version: PROTOCOL.version,
    phase: "MVP",
    targetChains: ["ETH", "SOL", "BASE", "BNB"],
    supportedChains: chains.map((c) => c.key),
    modules: [
      { id: "auth", status: "ready", endpoints: ["login", "signup", "me", "forgot-password"] },
      { id: "dashboard", status: "ready", endpoints: ["stats", "transactions", "activity", "upcoming"] },
      { id: "employees", status: "ready", endpoints: ["list", "create", "update", "delete", "approve", "encrypt-roster"] },
      { id: "payroll_batch", status: "ready", endpoints: ["execute", "history", "runs", "csv-batch"] },
      { id: "payroll_pipeline", status: "ready", stages: PROTOCOL.pipeline.stages.map((s) => s.key) },
      { id: "recurring", status: "ready", endpoints: ["delegations", "schedules", "templates"] },
      { id: "zk_privacy", status: "ready", provider: PROTOCOL.privacy.zkProvider },
      { id: "fhe_state", status: "ready", provider: PROTOCOL.privacy.fheProvider },
      { id: "cctp_bridge", status: "ready", endpoints: ["burn", "attest", "mint"] },
      { id: "hyperlane_sync", status: "ready", endpoints: ["dispatch", "deliver"] },
      { id: "shielded_pool", status: "ready", contract: "ShieldedPool" },
      { id: "treasury", status: "ready", endpoints: ["balances", "deposit", "withdraw", "rebalance"] },
      { id: "compliance", status: "ready", endpoints: ["score", "status", "kyc", "kyb", "aml", "audit", "viewing-keys"] },
      { id: "tax_docs", status: "ready", documents: PROTOCOL.compliance.taxDocuments },
      { id: "wallets", status: "ready", endpoints: ["register", "list", "set-default"] },
      { id: "swap", status: "ready", venue: "uniswap-trading-api" },
      { id: "smart_contracts", status: "ready", contracts: Object.keys(PROTOCOL.contracts) },
      { id: "agent_payroll", status: "partial", note: "Phase 3 preview endpoints enabled" },
      { id: "white_label", status: "partial", endpoints: ["saas-tiers", "branding"] },
    ],
    fees: PROTOCOL.fees,
    privacy: PROTOCOL.privacy,
  };
}

module.exports = { getMvpCapabilities };
