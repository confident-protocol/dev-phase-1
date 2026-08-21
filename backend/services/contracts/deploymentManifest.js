const { PROTOCOL } = require("../../config/protocol");

const DEPLOYMENT_MANIFEST = {
  networkProfiles: {
    local: { confirmations: 1, gasMultiplier: 1.1 },
    testnet: { confirmations: 3, gasMultiplier: 1.25 },
    mainnet: { confirmations: 5, gasMultiplier: 1.15 },
  },
  artifacts: [
    { name: "ConfidentialPayroll", path: "contracts/ConfidentialPayroll.sol", upgradeable: false },
    { name: "ShieldedPool", path: "contracts/ShieldedPool.sol", upgradeable: false },
    { name: "CrossChainSettlement", path: "contracts/CrossChainSettlement.sol", upgradeable: false },
    { name: "IncomeProver", path: "contracts/IncomeProver.sol", upgradeable: false },
    { name: "LigeroVerifier", path: "contracts/LigeroVerifier.sol", upgradeable: false },
  ],
  addresses: PROTOCOL.contracts,
  notes: [
    "Addresses in PROTOCOL.contracts are orchestrator placeholders for demo / interview environments.",
    "Production deployments bind CCTP MessageTransmitter + Hyperlane Mailbox per chain.",
  ],
};

module.exports = { DEPLOYMENT_MANIFEST };
