const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const privercyContext = require("../middlewares/protocol/privacyContext");
const chainGuard = require("../middlewares/protocol/chainGuard");
     
const { 
  enqueueAgentPayment,
  settleAgentPayment,
  listAgentJobs,
} = require("../services/agents/agentPayrollService");
const { appendAudit } = require("../services/compliance/auditTrail");

exports.enqueue = (req, res) => {
  const job = enqueueAgentPayment(req.body || {});
  appendAudit({ type: "agent_payment_queued", jobId: job.jobId, amount: job.amount });
  res.status(201).json({ success: true, job });
};

exports.settle = (req, res) => {
  const job = settleAgentPayment(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, message: "Job not found" });
  res.status(200).json({ success: true, job });
};

exports.list = (req, res) => {
  res.status(200).json({ success: true, items: listAgentJobs() });
};
