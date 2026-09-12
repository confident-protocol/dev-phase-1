const crypto = require("crypto");
const { generateProof } = require("../zk/ligeroProofService");
const { getEmployeeCipher } = require("./encryptedRoster");

const requests = new Map();

async function createIncomeThresholdRequest({ employeeId, threshold, requester }) {
  const leaf = getEmployeeCipher(employeeId);
  if (!leaf) {
    const err = new Error("Employee cipher not found in FHE roster");
    err.statusCode = 404;
    throw err;
  }

  const requestId = `inc_${crypto.randomBytes(6).toString("hex")}`;
  const thresholdCipher = `euint64_thr_${crypto.createHash("sha256").update(String(threshold)).digest("hex").slice(0, 32)}`;
  const zk = await generateProof(
    "income_threshold_v1",
    { salaryCipher: leaf.salaryCipher, thresholdCipher },
    { requestId, thresholdCommitment: crypto.createHash("sha256").update(String(threshold)).digest("hex") }
  );

  // Indistinguishable on-chain result handle (approval/denial same shape)
  const resultHandle = `ebool_${crypto.createHash("sha256").update(requestId + leaf.salaryCipher).digest("hex").slice(0, 40)}`;
  const record = {
    requestId,
    employeeId,
    requester: requester || "verifier",
    threshold,
    thresholdCipher,
    resultHandle,
    zkProofId: zk.proofId,
    status: "settled",
    decryptableBy: [leaf.wallet, requester || "verifier"],
    createdAt: new Date().toISOString(),
  };
  requests.set(requestId, record);
  return record;
}

function getIncomeRequest(requestId) {
  return requests.get(requestId) || null;
}

module.exports = { createIncomeThresholdRequest, getIncomeRequest };
