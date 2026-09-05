const express = require("express");
const ctrl = require("../controllers/mvpController");
const { optionalAuth } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { attachContractRegistry } = require("../middlewares/protocol/contractGuard");
const { attachSupportedChains } = require("../middlewares/protocol/chainGuard");
const { softRateLimit } = require("../middlewares/common/rateLimitSoft");

const router = express.Router();
const base = [
  optionalAuth,
  attachWorkspace,
  attachPrivacyContext,
  attachSupportedChains,
  softRateLimit({ max: 200 }),
];

router.get("/mvp/capabilities", ...base, attachContractRegistry, ctrl.capabilities);
router.get("/mvp/status", ...base, ctrl.status);

module.exports = router;
