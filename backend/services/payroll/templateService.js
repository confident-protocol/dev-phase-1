const crypto = require("crypto");
const { templates } = require("../../data/businessData");

function listTemplates() {
  return [...templates];
}

function getTemplate(id) {
  return templates.find((t) => t.id === id) || null;
}

function createTemplate(payload = {}) {
  const row = {
    id: payload.id || `t_${crypto.randomBytes(3).toString("hex")}`,
    name: payload.name || "Untitled template",
    employees: Number(payload.employees) || (payload.employeeIds || []).length || 0,
    amount: Number(payload.amount) || 0,
    chain: payload.chain || "BNB",
    employeeIds: payload.employeeIds || [],
    lastUsed: payload.lastUsed || null,
    privacy: payload.privacy || "zk+fhe",
  };
  templates.push(row);
  return row;
}

function updateTemplate(id, patch = {}) {
  const row = getTemplate(id);
  if (!row) return null;
  Object.assign(row, {
    name: patch.name ?? row.name,
    employees: patch.employees != null ? Number(patch.employees) : row.employees,
    amount: patch.amount != null ? Number(patch.amount) : row.amount,
    chain: patch.chain ?? row.chain,
    employeeIds: patch.employeeIds ?? row.employeeIds,
    privacy: patch.privacy ?? row.privacy,
  });
  return row;
}

function deleteTemplate(id) {
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  templates.splice(idx, 1);
  return true;
}

module.exports = { listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate };
