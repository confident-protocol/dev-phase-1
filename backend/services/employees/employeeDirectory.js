const crypto = require("crypto");
const { employees } = require("../../data/businessData");
const { upsertEmployeeCipher, seedFromEmployees, buildRosterRoot } = require("../fhe/encryptedRoster");

function listEmployees({ status, chain, q } = {}) {
  let items = [...employees];
  if (status) items = items.filter((e) => e.status === status);
  if (chain) items = items.filter((e) => String(e.chain).toLowerCase() === String(chain).toLowerCase());
  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter(
      (e) =>
        e.name.toLowerCase().includes(needle) ||
        e.role.toLowerCase().includes(needle) ||
        (e.email || "").toLowerCase().includes(needle)
    );
  }
  return items;
}

function getEmployee(id) {
  return employees.find((e) => e.id === id) || null;
}

function createEmployee(payload = {}) {
  const id = payload.id || `e_${crypto.randomBytes(3).toString("hex")}`;
  const row = {
    id,
    name: payload.name || "New Contractor",
    wallet: payload.wallet || `0x${crypto.randomBytes(20).toString("hex")}`,
    role: payload.role || "Contractor",
    salary: Number(payload.salary) || 0,
    status: payload.status || "pending",
    lastPaid: payload.lastPaid || "—",
    email: payload.email || `${id}@confidentialpay.com`,
    startDate: payload.startDate || new Date().toISOString().slice(0, 10),
    chain: payload.chain || "BNB",
  };
  employees.push(row);
  upsertEmployeeCipher({
    employeeId: row.id,
    wallet: row.wallet,
    name: row.name,
    role: row.role,
    salary: row.salary,
    chain: row.chain,
  });
  return row;
}

function updateEmployee(id, patch = {}) {
  const row = getEmployee(id);
  if (!row) return null;
  Object.assign(row, {
    name: patch.name ?? row.name,
    wallet: patch.wallet ?? row.wallet,
    role: patch.role ?? row.role,
    salary: patch.salary != null ? Number(patch.salary) : row.salary,
    status: patch.status ?? row.status,
    email: patch.email ?? row.email,
    chain: patch.chain ?? row.chain,
    startDate: patch.startDate ?? row.startDate,
  });
  upsertEmployeeCipher({
    employeeId: row.id,
    wallet: row.wallet,
    name: row.name,
    role: row.role,
    salary: row.salary,
    chain: row.chain,
  });
  return row;
}

function deleteEmployee(id) {
  const idx = employees.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  employees.splice(idx, 1);
  return true;
}

function approveEmployee(id) {
  return updateEmployee(id, { status: "active" });
}

function bulkImport(rows = []) {
  return rows.map((r) => createEmployee(r));
}

function ensureSeededRoster() {
  seedFromEmployees(employees);
  return buildRosterRoot();
}

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  approveEmployee,
  bulkImport,
  ensureSeededRoster,
};
