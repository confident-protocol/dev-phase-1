const crypto = require("crypto");

const documents = [];

function generateTaxDocument({ employeeId, type, taxYear, jurisdiction }) {
  const docType = type || "1099";
  const allowed = ["W-8BEN", "1099", "EU-equiv"];
  if (!allowed.includes(docType)) {
    const err = new Error(`Unsupported tax document type: ${docType}`);
    err.statusCode = 400;
    throw err;
  }

  const doc = {
    id: `tax_${crypto.randomBytes(4).toString("hex")}`,
    employeeId: employeeId || null,
    type: docType,
    taxYear: taxYear || new Date().getFullYear(),
    jurisdiction: jurisdiction || (docType === "EU-equiv" ? "EU" : "US"),
    status: "generated",
    downloadToken: crypto.randomBytes(12).toString("hex"),
    createdAt: new Date().toISOString(),
    privacy: "contains_no_onchain_salary_plaintext",
  };
  documents.unshift(doc);
  return doc;
}

function listTaxDocuments({ employeeId } = {}) {
  if (!employeeId) return documents.slice(0, 50);
  return documents.filter((d) => d.employeeId === employeeId);
}

function getTaxDocument(id) {
  return documents.find((d) => d.id === id) || null;
}

module.exports = { generateTaxDocument, listTaxDocuments, getTaxDocument };
