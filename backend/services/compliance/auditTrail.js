const crypto = require("crypto");

const events = [];

function appendAudit(event) {
  const row = {
    id: `aud_${crypto.randomBytes(4).toString("hex")}`,
    at: new Date().toISOString(),
    ...event,
  };
  events.unshift(row);
  return row;
}

function listAudit({ limit = 50 } = {}) {
  return events.slice(0, limit);
}

function proveDepositEqualsDistribution({ depositTotal, distributionTotal, runId }) {
  const balanced = Number(depositTotal) === Number(distributionTotal);
  const proof = {
    runId,
    depositTotal,
    distributionTotal,
    balanced,
    module: "on-chain-audit",
    hash: crypto.createHash("sha256").update(`${runId}:${depositTotal}:${distributionTotal}`).digest("hex"),
    checkedAt: new Date().toISOString(),
  };
  appendAudit({ type: "deposit_distribution_audit", ...proof });
  return proof;
}

module.exports = { appendAudit, listAudit, proveDepositEqualsDistribution };
