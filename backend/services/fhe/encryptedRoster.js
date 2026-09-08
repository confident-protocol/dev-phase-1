const crypto = require("crypto");
const { PROTOCOL } = require("../../config/protocol");

const roster = new Map();

function encryptSalary(salaryMicroUsdc, aclSubjects = []) {
  const handle = `euint64_${crypto.createHash("sha256").update(String(salaryMicroUsdc) + Math.random()).digest("hex").slice(0, 40)}`;
  return {
    handle,
    provider: PROTOCOL.privacy.fheProvider,
    acl: [...new Set(aclSubjects)],
    createdAt: new Date().toISOString(),
  };
}

function upsertEmployeeCipher({ employeeId, wallet, name, role, salary, chain }) {
  const micro = Math.round(Number(salary) * 1_000_000);
  const cipher = encryptSalary(micro, ["employer", wallet]);
  const leaf = {
    employeeId,
    wallet,
    nameHash: crypto.createHash("sha256").update(name || "").digest("hex"),
    roleHash: crypto.createHash("sha256").update(role || "").digest("hex"),
    salaryCipher: cipher.handle,
    chain,
    active: true,
    updatedAt: new Date().toISOString(),
  };
  roster.set(employeeId, leaf);
  return leaf;
}

function buildRosterRoot(employeeIds = null) {
  const leaves = [...roster.values()]
    .filter((e) => e.active && (!employeeIds || employeeIds.includes(e.employeeId)))
    .map((e) => crypto.createHash("sha256").update(`${e.employeeId}:${e.salaryCipher}:${e.wallet}`).digest("hex"))
    .sort();
  const root = crypto.createHash("sha256").update(leaves.join("|") || "empty").digest("hex");
  return { root: `0x${root}`, leafCount: leaves.length, leaves };
}

function getEmployeeCipher(employeeId) {
  return roster.get(employeeId) || null;
}

function listRoster() {
  return [...roster.values()];
}

function seedFromEmployees(employees = []) {
  employees.forEach((emp) => {
    upsertEmployeeCipher({
      employeeId: emp.id,
      wallet: emp.wallet,
      name: emp.name,
      role: emp.role,
      salary: emp.salary,
      chain: emp.chain,
    });
  });
  return buildRosterRoot();
}

module.exports = {
  encryptSalary,
  upsertEmployeeCipher,
  buildRosterRoot,
  getEmployeeCipher,
  listRoster,
  seedFromEmployees,
};
