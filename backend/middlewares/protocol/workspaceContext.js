const { ADMIN_USER, settingsData } = require("../../data/businessData");
const { PROTOCOL } = require("../../config/protocol");

function attachWorkspace(req, res, next) {
  req.workspace = {
    company: settingsData.company || ADMIN_USER.company,
    defaultChain: settingsData.defaultChain || "BNB",
    privacyLevel: settingsData.privacyLevel || "high",
    protocol: PROTOCOL.name,
    version: PROTOCOL.version,
    actor: req.user
      ? { id: req.user.id || req.user._id, email: req.user.email, role: req.user.role }
      : null,
  };
  next();
}

function requireWorkspace(req, res, next) {
  if (!req.workspace) {
    return res.status(500).json({ success: false, message: "Workspace context missing" });
  }
  next();
}

module.exports = { attachWorkspace, requireWorkspace };
