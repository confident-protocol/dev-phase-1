const crypto = require("crypto");

const agentJobs = new Map();

function enqueueAgentPayment({ agentId, wallet, amount, chain, memo }) {
  const jobId = `agent_${crypto.randomBytes(4).toString("hex")}`;
  const record = {
    jobId,
    agentId: agentId || `ai_${crypto.randomBytes(3).toString("hex")}`,
    wallet,
    amount: Number(amount) || 0,
    chain: chain || "BASE",
    memo: memo || "agentic micropayment",
    privacy: "zk-shielded",
    status: "queued",
    createdAt: new Date().toISOString(),
  };
  agentJobs.set(jobId, record);
  return record;
}

function settleAgentPayment(jobId) {
  const job = agentJobs.get(jobId);
  if (!job) return null;
  job.status = "settled";
  job.settledAt = new Date().toISOString();
  job.txHash = `0xagent_${crypto.randomBytes(8).toString("hex")}`;
  return job;
}

function listAgentJobs() {
  return [...agentJobs.values()];
}

module.exports = { enqueueAgentPayment, settleAgentPayment, listAgentJobs };
