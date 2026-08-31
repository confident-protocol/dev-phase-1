const crypto = require("crypto");
const { employees, transactions } = require("../../data/businessData");
const { seedFromEmployees, buildRosterRoot } = require("../fhe/encryptedRoster");
const { runPipelineToCompletion } = require("./pipelineOrchestrator");
const { PROTOCOL } = require("../../config/protocol");

const runs = new Map();

function ensureRosterSeeded() {
  if (buildRosterRoot().leafCount === 0) {
    seedFromEmployees(employees);
  }
}

async function executeBatchPayroll({
  employeeIds,
  sourceChain,
  destChain,
  chain,
  templateId,
  feeBps,
  privacy,
}) {
  ensureRosterSeeded();
  const selected = employees.filter((e) => !employeeIds?.length || employeeIds.includes(e.id));
  const active = selected.filter((e) => e.status === "active");
  const amount = active.reduce((sum, e) => sum + Number(e.salary || 0), 0);
  const runId = `run_${crypto.randomBytes(5).toString("hex")}`;
  const resolvedSource = sourceChain || chain || "BNB";
  const resolvedDest = destChain || (resolvedSource === "ETH" ? "BASE" : "ETH");

  const pipeline = await runPipelineToCompletion({
    amount,
    sourceChain: resolvedSource,
    destChain: resolvedDest,
    employeeIds: active.map((e) => e.id),
    recipients: active.map((e) => e.wallet),
    templateId,
    feeBps: feeBps || PROTOCOL.fees.defaultBps,
    treasuryWallet: PROTOCOL.contracts.ConfidentialPayroll.bnb,
  });

  const record = {
    runId,
    contract: "ConfidentialPayroll",
    contractAddress: PROTOCOL.contracts.ConfidentialPayroll.bnb,
    method: "runPayroll",
    rosterRoot: pipeline.rosterRoot,
    zkProofId: pipeline.zkProofId,
    pipelineId: pipeline.pipelineId,
    employeeCount: active.length,
    amount,
    fee: pipeline.fee,
    feeBps: pipeline.feeBps,
    sourceChain: pipeline.sourceChain,
    destChain: pipeline.destChain,
    privacy: privacy || "zk+fhe",
    status: pipeline.status === "completed" ? "completed" : "failed",
    txHash: `0xpayroll_${crypto.randomBytes(8).toString("hex")}`,
    createdAt: new Date().toISOString(),
    employees: active.map((e) => ({ id: e.id, wallet: e.wallet, chain: e.chain })),
  };

  runs.set(runId, record);
  transactions.unshift({
    id: record.txHash.slice(0, 8),
    type: "payroll",
    amount,
    status: record.status,
    chain: record.sourceChain,
    date: record.createdAt,
    employees: active.length,
    fee: record.fee,
    pipelineId: pipeline.pipelineId,
    runId,
  });

  return { run: record, pipeline };
}

function getRun(runId) {
  return runs.get(runId) || null;
}

function listRuns() {
  return [...runs.values()];
}

module.exports = { executeBatchPayroll, getRun, listRuns, ensureRosterSeeded };
