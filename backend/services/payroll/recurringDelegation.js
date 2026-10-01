const crypto = require("crypto");

const delegations = new Map();

function createRecurringDelegation({
  name,
  employeeIds,
  cadence,
  sourceChain,
  destChain,
  nextRunAt,
  templateId,
}) {
  const id = `deleg_${crypto.randomBytes(4).toString("hex")}`;
  const record = {
    id,
    name: name || "Recurring payroll delegation",
    employeeIds: employeeIds || [],
    cadence: cadence || "monthly",
    sourceChain: sourceChain || "BNB",
    destChain: destChain || "ETH",
    nextRunAt: nextRunAt || new Date(Date.now() + 14 * 86400000).toISOString(),
    templateId,
    status: "active",
    createdAt: new Date().toISOString(),
    solanaSubscriptionHint: cadence === "solana-subscription" ? {
      program: "ConfPaySubs111111111111111111111111111",
      scheduleSlotSkew: 120,
    } : null,
  };
  delegations.set(id, record);
  return record;
}

function listDelegations() {
  return [...delegations.values()];
}

function cancelDelegation(id) {
  const d = delegations.get(id);
  if (!d) return null;
  d.status = "cancelled";
  d.cancelledAt = new Date().toISOString();
  return d;
}

module.exports = { createRecurringDelegation, listDelegations, cancelDelegation };
