const crypto = require("crypto");
const { resolveChain } = require("../../config/chains");

const dispatches = new Map();

function dispatchStateSync({ sourceChain, destChain, body, recipient }) {
  const source = resolveChain(sourceChain);
  const dest = resolveChain(destChain);
  if (!source || !dest) {
    const err = new Error("Unsupported Hyperlane domain");
    err.statusCode = 400;
    throw err;
  }

  const messageId = `0x${crypto.createHash("sha256").update(JSON.stringify({ source, dest, body, recipient, t: Date.now() })).digest("hex")}`;
  const record = {
    messageId,
    source: source.key,
    dest: dest.key,
    sourceDomain: source.hyperlaneDomain,
    destDomain: dest.hyperlaneDomain,
    recipient,
    body,
    status: "dispatched",
    createdAt: new Date().toISOString(),
  };
  dispatches.set(messageId, record);
  return record;
}

function markDelivered(messageId) {
  const msg = dispatches.get(messageId);
  if (!msg) return null;
  msg.status = "delivered";
  msg.deliveredAt = new Date().toISOString();
  return msg;
}

function listDispatches() {
  return [...dispatches.values()];
}

module.exports = { dispatchStateSync, markDelivered, listDispatches };
