const crypto = require("crypto");
const { resolveChain } = require("../../config/chains");

const attestations = new Map();
const burns = new Map();

function initiateBurn({ sourceChain, destChain, amount, sender }) {
  const source = resolveChain(sourceChain);
  const dest = resolveChain(destChain);
  if (!source || !dest) {
    const err = new Error("Unsupported CCTP domain pair");
    err.statusCode = 400;
    throw err;
  }
  if (!(amount > 0)) {
    const err = new Error("Amount must be positive");
    err.statusCode = 400;
    throw err;
  }

  const burnId = `cctp_burn_${crypto.randomBytes(6).toString("hex")}`;
  const messageHash = crypto
    .createHash("sha256")
    .update(`${source.cctpDomain}:${dest.cctpDomain}:${amount}:${sender}:${Date.now()}`)
    .digest("hex");

  const record = {
    burnId,
    status: "awaiting_attestation",
    source: source.key,
    dest: dest.key,
    sourceDomain: source.cctpDomain,
    destDomain: dest.cctpDomain,
    amount,
    sender,
    messageHash: `0x${messageHash}`,
    createdAt: new Date().toISOString(),
  };
  burns.set(burnId, record);
  return record;
}

function attachAttestation(burnId) {
  const burn = burns.get(burnId);
  if (!burn) return null;
  const attestationHash = crypto.createHash("sha256").update(burn.messageHash + "attestation").digest("hex");
  const attestation = {
    burnId,
    attestationHash: `0x${attestationHash}`,
    status: "ready_to_mint",
    message: burn.messageHash,
    attestation: `0x${crypto.randomBytes(32).toString("hex")}`,
    createdAt: new Date().toISOString(),
  };
  burn.status = "attested";
  burn.attestationHash = attestation.attestationHash;
  attestations.set(attestation.attestationHash, attestation);
  return { burn, attestation };
}

function mintOnDestination(attestationHash, recipient) {
  const attestation = attestations.get(attestationHash);
  if (!attestation) return null;
  attestation.status = "minted";
  attestation.recipient = recipient;
  attestation.mintedAt = new Date().toISOString();
  const burn = burns.get(attestation.burnId);
  if (burn) burn.status = "completed";
  return { attestation, burn };
}

function getBurn(burnId) {
  return burns.get(burnId) || null;
}

function listBurns() {
  return [...burns.values()];
}

module.exports = {
  initiateBurn,
  attachAttestation,
  mintOnDestination,
  getBurn,
  listBurns,
};
