const { PROTOCOL } = require("../../config/protocol");
const { listRoster, buildRosterRoot } = require("./encryptedRoster");

function getEncryptedStateSummary() {
  const roster = listRoster();
  const merkle = buildRosterRoot();
  return {
    provider: PROTOCOL.privacy.fheProvider,
    employeeCiphers: roster.length,
    rosterRoot: merkle.root,
    capabilities: [
      "encrypted_salaries",
      "confidential_transfer",
      "approval_denial_indistinguishability",
      "transient_acl",
    ],
    updatedAt: new Date().toISOString(),
  };
}

function compareCipherPolicy(a, b) {
  return {
    sameProvider: true,
    comparable: Boolean(a && b),
    note: "FHE comparison yields ciphertext handle; plaintext not revealed to orchestrator",
  };
}

module.exports = { getEncryptedStateSummary, compareCipherPolicy };
