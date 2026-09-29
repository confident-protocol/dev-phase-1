/**
 * Central in-memory store. Replaces MongoDB collections for the demo orchestrator.
 */
const { employees, transactions, scheduled, templates, services } = require("./businessData");

const store = {
  employees: [...employees],
  transactions: [...transactions],
  scheduled: [...scheduled],
  templates: [...templates],
  services: [...services],
  sessions: new Map(),
  proofs: new Map(),
  notifications: [],
};

function snapshot() {
  return {
    employees: store.employees.length,
    transactions: store.transactions.length,
    scheduled: store.scheduled.length,
    templates: store.templates.length,
    services: store.services.length,
    sessions: store.sessions.size,
    mode: "memory-mock",
  };
}

module.exports = { store, snapshot };
