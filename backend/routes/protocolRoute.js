const express = require("express");
const {
  getProtocolInfo,
  getHealth,
  getChains,
  getCircuits,
  getFeeSchedule,
  getDeploymentManifest,
  getCircuitGraph,
  getFheState,
} = require("../controllers/protocolController");
const { optionalAuth } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext, requireZkHeaders } = require("../middlewares/protocol/privacyContext");
const { attachSupportedChains } = require("../middlewares/protocol/chainGuard");
const { attachContractRegistry } = require("../middlewares/protocol/contractGuard");
const { softRateLimit } = require("../middlewares/common/rateLimitSoft");

const router = express.Router();

const readMw = [optionalAuth, attachWorkspace, attachPrivacyContext, softRateLimit({ max: 300 })];

router.get("/protocol", ...readMw, attachContractRegistry, getProtocolInfo);
router.get("/protocol/health", ...readMw, getHealth);
router.get("/protocol/chains", ...readMw, attachSupportedChains, getChains);
router.get("/protocol/circuits", ...readMw, requireZkHeaders, getCircuits);
router.get("/protocol/circuit-graph", ...readMw, requireZkHeaders, getCircuitGraph);
router.get("/protocol/fees", ...readMw, getFeeSchedule);
router.get("/protocol/deployments", ...readMw, attachContractRegistry, getDeploymentManifest);
router.get("/protocol/fhe-state", ...readMw, getFheState);

module.exports = router;
