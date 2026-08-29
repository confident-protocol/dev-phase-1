const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { protocolSnapshot } = require("../services/contracts/contractRegistry");
const { DEPLOYMENT_MANIFEST } = require("../services/contracts/deploymentManifest");
const { listSupportedChains } = require("../config/chains");
const { PROTOCOL } = require("../config/protocol");
const { listCircuits } = require("../services/zk/ligeroProofService");
const { describeCircuitGraph } = require("../services/zk/circuitRegistry");
const { getEncryptedStateSummary } = require("../services/fhe/fhenixStateService");

exports.getProtocolInfo = (req, res) => {
  res.status(200).json({
    success: true,
    ...protocolSnapshot(),
  });
};

exports.getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    service: PROTOCOL.name,
    version: PROTOCOL.version,
    uptimeSec: Math.floor(process.uptime()),
    components: {
      apiOrchestrator: "up",
      zkProver: PROTOCOL.privacy.zkProvider,
      fheState: PROTOCOL.privacy.fheProvider,
      cctp: "simulated",
      hyperlane: "simulated",
    },
  });
};

exports.getChains = (req, res) => {
  res.status(200).json({ success: true, chains: listSupportedChains() });
};

exports.getCircuits = (req, res) => {
  res.status(200).json({ success: true, ...listCircuits() });
};

exports.getFeeSchedule = (req, res) => {
  res.status(200).json({
    success: true,
    transactionFeeBps: {
      min: PROTOCOL.fees.minBps,
      max: PROTOCOL.fees.maxBps,
      default: PROTOCOL.fees.defaultBps,
    },
    saas: PROTOCOL.fees.enterpriseSaasTiers,
  });
};

exports.getDeploymentManifest = (req, res) => {
  res.status(200).json({ success: true, manifest: DEPLOYMENT_MANIFEST });
};

exports.getCircuitGraph = (req, res) => {
  res.status(200).json({ success: true, graph: describeCircuitGraph() });
};

exports.getFheState = (req, res) => {
  res.status(200).json({ success: true, state: getEncryptedStateSummary() });
};
