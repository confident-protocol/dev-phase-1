const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const {
  VALID_EMAIL,
  VALID_PASSWORD,
  ADMIN_USER,
  employees,
  transactions,
  scheduled,
  templates,
  dashboardStats,
  complianceData,
  settingsData,
  bridgeData,
  treasuryBalances,
  buildActivitySeries,
} = require('../data/businessData');
const { PROTOCOL } = require('../config/protocol');
const { listSupportedChains } = require('../config/chains');
const { buildRosterRoot, seedFromEmployees, listRoster } = require('../services/fhe/encryptedRoster');
const { listPipelines } = require('../services/payroll/pipelineOrchestrator');
const { listRuns } = require('../services/payroll/batchPayrollRunner');

function sendSuccess(res, data) {
  return res.status(200).json({ success: true, ...data });
}

exports.login = (req, res) => {
  const { email, password } = req.body || {};
  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    return res.status(200).json({
      token: `mock-${Date.now()}`,
      user: ADMIN_USER,
      protocol: {
        name: PROTOCOL.name,
        version: PROTOCOL.version,
      },
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};

exports.signup = (req, res) => {
  const { email, password, name, company } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }
  const user = {
    email,
    name: name || "Workspace Admin",
    role: "admin",
    company: company || "ConfidentialPay Workspace",
  };
  return res.status(201).json({
    success: true,
    token: `mock-${Date.now()}`,
    user,
    protocol: { name: PROTOCOL.name, version: PROTOCOL.version },
  });
};

exports.me = (req, res) => {
  sendSuccess(res, { user: ADMIN_USER, protocolVersion: PROTOCOL.version });
};

exports.dashboard = {
  stats: (req, res) =>
    sendSuccess(res, {
      ...dashboardStats,
      openPipelines: listPipelines().filter((p) => p.status === 'running' || p.status === 'queued').length,
      payrollRuns: listRuns().length,
      supportedChains: listSupportedChains().length,
    }),
  transactions: (req, res) => sendSuccess(res, { items: transactions }),
  activity: (req, res) => {
    const range = req.query.range || 'monthly';
    sendSuccess(res, { series: buildActivitySeries(range) });
  },
  upcoming: (req, res) => sendSuccess(res, { items: scheduled }),
};

exports.employees = (req, res) => {
  if (listRoster().length === 0) seedFromEmployees(employees);
  sendSuccess(res, {
    items: employees,
    encryptedRosterRoot: buildRosterRoot().root,
    privacy: PROTOCOL.privacy,
  });
};

exports.scheduledPayrolls = (req, res) => sendSuccess(res, { items: scheduled });
exports.payrollHistory = (req, res) =>
  sendSuccess(res, {
    items: transactions.filter((t) => t.type === 'payroll'),
    runs: listRuns(),
  });
exports.templates = (req, res) => sendSuccess(res, { items: templates });
exports.treasury = (req, res) => sendSuccess(res, treasuryBalances);
exports.compliance = (req, res) => sendSuccess(res, complianceData);
exports.bridge = (req, res) => sendSuccess(res, bridgeData);
exports.settings = (req, res) =>
  sendSuccess(res, {
    ...settingsData,
    protocol: PROTOCOL.name,
    version: PROTOCOL.version,
    feeBpsDefault: PROTOCOL.fees.defaultBps,
    chains: listSupportedChains(),
  });
