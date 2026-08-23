const crypto = require("crypto");
const { scheduled } = require("../../data/businessData");

function listSchedules() {
  return [...scheduled];
}

function createSchedule(payload = {}) {
  const row = {
    id: payload.id || `s_${crypto.randomBytes(3).toString("hex")}`,
    date: payload.date || new Date(Date.now() + 7 * 86400000).toISOString(),
    employees: Number(payload.employees) || (payload.employeeIds || []).length || 0,
    amount: Number(payload.amount) || 0,
    chain: payload.chain || "BNB",
    destChain: payload.destChain || "ETH",
    template: payload.template || payload.templateName || "Custom",
    templateId: payload.templateId || null,
    employeeIds: payload.employeeIds || [],
    privacy: payload.privacy || "high",
    status: "scheduled",
  };
  scheduled.push(row);
  return row;
}

function cancelSchedule(id) {
  const row = scheduled.find((s) => s.id === id);
  if (!row) return null;
  row.status = "cancelled";
  row.cancelledAt = new Date().toISOString();
  return row;
}

function deleteSchedule(id) {
  const idx = scheduled.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  scheduled.splice(idx, 1);
  return true;
}

module.exports = { listSchedules, createSchedule, cancelSchedule, deleteSchedule };
