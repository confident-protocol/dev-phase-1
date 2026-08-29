const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { settingsData, employees, dashboardStats } = require("../data/businessData");
const { PROTOCOL } = require("../config/protocol");
const { listSupportedChains } = require("../config/chains");

exports.getWorkspace = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    workspace: req.workspace,
    settings: settingsData,
    stats: {
      activeEmployees: dashboardStats.activeEmployees,
      privacyScore: dashboardStats.privacyScore,
    },
    chains: listSupportedChains(),
    protocol: { name: PROTOCOL.name, version: PROTOCOL.version },
  });
});

exports.getRosterSummary = asyncErrorHandler(async (req, res) => {
  const active = employees.filter((e) => e.status === "active").length;
  res.status(200).json({
    success: true,
    total: employees.length,
    active,
    pending: employees.filter((e) => e.status === "pending").length,
    byChain: employees.reduce((acc, e) => {
      acc[e.chain] = (acc[e.chain] || 0) + 1;
      return acc;
    }, {}),
  });
});
