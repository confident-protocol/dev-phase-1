const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { getMvpCapabilities } = require("../services/mvp/capabilityMatrix");
const { snapshot } = require("../data/mockStore");
const { listPipelines } = require("../services/payroll/pipelineOrchestrator");
const { listRuns } = require("../services/payroll/batchPayrollRunner");
const { PROTOCOL } = require("../config/protocol");

exports.capabilities = asyncErrorHandler(async (req, res) => {
  res.status(200).json({ success: true, mvp: getMvpCapabilities() });
});

exports.status = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    phase: "MVP",
    dataMode: "mock",
    protocol: PROTOCOL.version,
    store: snapshot(),
    live: {
      openPipelines: listPipelines().filter((p) => p.status === "running" || p.status === "queued").length,
      payrollRuns: listRuns().length,
    },
  });
});
