const crypto = require("crypto");
const { employees } = require("../../data/businessData");

const companyKyb = {
  companyId: "kyb_confidentialpay",
  legalName: "ConfidentialPay Inc",
  verified: true,
  documents: [
    { id: "d1", type: "certificate_of_incorporation", status: "verified" },
    { id: "d2", type: "beneficial_ownership", status: "verified" },
    { id: "d3", type: "operating_agreement", status: "verified" },
  ],
  verifiedAt: "2024-03-01T00:00:00Z",
};

const employeeKyc = new Map();

function seedEmployeeKyc() {
  employees.forEach((e, i) => {
    if (employeeKyc.has(e.id)) return;
    employeeKyc.set(e.id, {
      id: e.id,
      name: e.name,
      level: i % 2 === 0 ? "Full" : "Basic",
      documents: i % 2 === 0 ? 3 : 1,
      total: 3,
      status: i % 3 === 0 ? "verified" : "pending",
      updatedAt: new Date().toISOString(),
    });
  });
}

function getKybStatus() {
  return {
    company: {
      verified: companyKyb.verified,
      documents: companyKyb.documents.filter((d) => d.status === "verified").length,
      total: companyKyb.documents.length,
      legalName: companyKyb.legalName,
    },
    documents: companyKyb.documents,
  };
}

function getComplianceStatus() {
  seedEmployeeKyc();
  return {
    company: getKybStatus().company,
    employees: [...employeeKyc.values()].slice(0, 12),
  };
}

function getComplianceScore() {
  seedEmployeeKyc();
  const verified = [...employeeKyc.values()].filter((e) => e.status === "verified").length;
  const total = employeeKyc.size || 1;
  const kyc = Math.round((verified / total) * 100);
  return {
    score: 96,
    kyc: Math.max(85, kyc),
    aml: 88,
    tax: 92,
    privacy: 96,
  };
}

function submitEmployeeKyc(employeeId, payload = {}) {
  seedEmployeeKyc();
  const existing = employeeKyc.get(employeeId) || {
    id: employeeId,
    name: payload.name || employeeId,
    level: "Basic",
    documents: 0,
    total: 3,
    status: "pending",
  };
  existing.documents = Math.min(3, (existing.documents || 0) + 1);
  existing.level = payload.level || (existing.documents >= 3 ? "Full" : existing.level);
  existing.status = existing.documents >= 3 ? "verified" : "pending";
  existing.updatedAt = new Date().toISOString();
  existing.lastSubmissionId = `kyc_${crypto.randomBytes(3).toString("hex")}`;
  employeeKyc.set(employeeId, existing);
  return existing;
}

function submitKybDocument(docType) {
  const doc = {
    id: `d_${crypto.randomBytes(2).toString("hex")}`,
    type: docType || "supporting_document",
    status: "pending_review",
    uploadedAt: new Date().toISOString(),
  };
  companyKyb.documents.push(doc);
  return doc;
}

module.exports = {
  getKybStatus,
  getComplianceStatus,
  getComplianceScore,
  submitEmployeeKyc,
  submitKybDocument,
};
