const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { settingsData } = require("../data/businessData");
const { PROTOCOL } = require("../config/protocol");
const { listSupportedChains } = require("../config/chains");

const team = [
  { id: "u1", name: "Admin User", email: "admin@confidentialpay.com", role: "Owner" },
  { id: "u2", name: "Sara Lopez", email: "sara@confidentialpay.com", role: "Admin" },
  { id: "u3", name: "Mike Tanaka", email: "mike@confidentialpay.com", role: "Viewer" },
];

exports.getSettings = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    ...settingsData,
    protocol: PROTOCOL.name,
    version: PROTOCOL.version,
    feeBpsDefault: PROTOCOL.fees.defaultBps,
    chains: listSupportedChains(),
  });
});

exports.updateSettings = asyncErrorHandler(async (req, res) => {
  const patch = req.body || {};
  if (patch.company) settingsData.company = patch.company;
  if (patch.defaultChain) settingsData.defaultChain = patch.defaultChain;
  if (patch.privacyLevel) settingsData.privacyLevel = patch.privacyLevel;
  if (patch.timezone) settingsData.timezone = patch.timezone;
  res.status(200).json({ success: true, ...settingsData });
});

exports.getTeam = asyncErrorHandler(async (req, res) => {
  res.status(200).json({ success: true, items: team });
});

exports.inviteTeamMember = asyncErrorHandler(async (req, res) => {
  const member = {
    id: `u_${Date.now().toString(36)}`,
    name: req.body?.name || "New Member",
    email: req.body?.email || "member@confidentialpay.com",
    role: req.body?.role || "Viewer",
  };
  team.push(member);
  res.status(201).json({ success: true, member });
});

exports.getSaasTiers = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    tiers: PROTOCOL.fees.enterpriseSaasTiers,
    whiteLabel: {
      setupFeeMin: 10000,
      setupFeeMax: 50000,
      royalty: "custom",
    },
  });
});
