const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const {
  startPipeline,
  advanceStage,
  runPipelineToCompletion,
  getPipeline,
  listPipelines,
} = require("../services/payroll/pipelineOrchestrator");
const { executeBatchPayroll, getRun, listRuns, ensureRosterSeeded } = require("../services/payroll/batchPayrollRunner");
const {
  createRecurringDelegation,
  listDelegations,
  cancelDelegation,
} = require("../services/payroll/recurringDelegation");
const { appendAudit } = require("../services/compliance/auditTrail");
const { seedFromEmployees, buildRosterRoot, listRoster } = require("../services/fhe/encryptedRoster");
const { employees } = require("../data/businessData");

ensureRosterSeeded();

exports.startPipeline = async (req, res, next) => {
  try {
    const pipeline = await startPipeline(req.body || {});
    appendAudit({ type: "pipeline_started", pipelineId: pipeline.pipelineId });
    res.status(201).json({ success: true, pipeline });
  } catch (err) {
    next(err);
  }
};

exports.runFullPipeline = async (req, res, next) => {
  try {
    const pipeline = await runPipelineToCompletion(req.body || {});
    appendAudit({ type: "pipeline_completed", pipelineId: pipeline.pipelineId, status: pipeline.status });
    res.status(201).json({ success: true, pipeline });
  } catch (err) {
    next(err);
  }
};

exports.advancePipeline = async (req, res, next) => {
  try {
    const pipeline = await advanceStage(req.params.pipelineId);
    if (!pipeline) return res.status(404).json({ success: false, message: "Pipeline not found" });
    res.status(200).json({ success: true, pipeline });
  } catch (err) {
    next(err);
  }
};

exports.getPipeline = (req, res) => {
  const pipeline = getPipeline(req.params.pipelineId);
  if (!pipeline) return res.status(404).json({ success: false, message: "Pipeline not found" });
  res.status(200).json({ success: true, pipeline });
};

exports.listPipelines = (req, res) => {
  res.status(200).json({ success: true, items: listPipelines() });
};

exports.executePayroll = async (req, res, next) => {
  try {
    const result = await executeBatchPayroll(req.body || {});
    appendAudit({ type: "payroll_run", runId: result.run.runId, amount: result.run.amount });
    res.status(200).json({ success: true, message: "Confidential payroll executed", ...result });
  } catch (err) {
    next(err);
  }
};

exports.listPayrollRuns = (req, res) => {
  res.status(200).json({ success: true, items: listRuns() });
};

exports.getPayrollRun = (req, res) => {
  const run = getRun(req.params.runId);
  if (!run) return res.status(404).json({ success: false, message: "Run not found" });
  res.status(200).json({ success: true, run });
};

exports.getEncryptedRoster = (req, res) => {
  if (listRoster().length === 0) seedFromEmployees(employees);
  res.status(200).json({
    success: true,
    roster: listRoster(),
    merkle: buildRosterRoot(),
  });
};

exports.createDelegation = (req, res) => {
  const delegation = createRecurringDelegation(req.body || {});
  appendAudit({ type: "delegation_created", delegationId: delegation.id });
  res.status(201).json({ success: true, delegation });
};

exports.listDelegations = (req, res) => {
  res.status(200).json({ success: true, items: listDelegations() });
};

exports.cancelDelegation = (req, res) => {
  const delegation = cancelDelegation(req.params.id);
  if (!delegation) return res.status(404).json({ success: false, message: "Delegation not found" });
  res.status(200).json({ success: true, delegation });
};
