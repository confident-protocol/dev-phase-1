const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { listBurns } = require("../services/bridge/cctpBridgeService");
const { listDispatches } = require("../services/bridge/hyperlaneRelayer");
const { listPipelines } = require("../services/payroll/pipelineOrchestrator");
const { listRuns } = require("../services/payroll/batchPayrollRunner");

exports.getSettlementBoard = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    board: {
      cctpBurns: listBurns().slice(0, 20),
      hyperlane: listDispatches().slice(0, 20),
      pipelines: listPipelines().slice(0, 20),
      payrollRuns: listRuns().slice(0, 20),
      feeContext: req.feeContext || null,
      chains: req.supportedChains || [],
    },
  });
});
