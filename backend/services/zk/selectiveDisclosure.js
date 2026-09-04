const crypto = require("crypto");
const { PROTOCOL } = require("../../config/protocol");

const viewingKeys = new Map();

function issueViewingKey({ employeeId, viewer, ttlSec, reason }) {
  const ttl = ttlSec || PROTOCOL.privacy.selectiveDisclosureDefaultTtlSec;
  const keyId = `vk_${crypto.randomBytes(8).toString("hex")}`;
  const expiresAt = Date.now() + ttl * 1000;
  const record = {
    keyId,
    employeeId,
    viewer,
    reason: reason || "compliance_audit",
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    material: crypto.createHash("sha256").update(`${employeeId}:${viewer}:${keyId}`).digest("hex"),
    status: "active",
  };
  viewingKeys.set(keyId, record);
  return record;
}

function revokeViewingKey(keyId) {
  const record = viewingKeys.get(keyId);
  if (!record) return null;
  record.status = "revoked";
  record.revokedAt = new Date().toISOString();
  return record;
}

function resolveDisclosure(keyId) {
  const record = viewingKeys.get(keyId);
  if (!record) return { allowed: false, reason: "unknown_key" };
  if (record.status !== "active") return { allowed: false, reason: "revoked" };
  if (Date.now() > Date.parse(record.expiresAt)) {
    record.status = "expired";
    return { allowed: false, reason: "expired" };
  }
  return {
    allowed: true,
    employeeId: record.employeeId,
    viewer: record.viewer,
    keyId,
    ciphertextRevealToken: record.material.slice(0, 32),
  };
}

function listActiveKeys() {
  return [...viewingKeys.values()].filter((k) => k.status === "active");
}

module.exports = {
  issueViewingKey,
  revokeViewingKey,
  resolveDisclosure,
  listActiveKeys,
};
