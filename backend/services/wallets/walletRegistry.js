const crypto = require("crypto");
const { settingsData } = require("../../data/businessData");
const { resolveChain } = require("../../config/chains");

const wallets = [
  ...(settingsData.wallets || []).map((w, i) => ({
    id: `w${i + 1}`,
    ...w,
    address: w.address,
    isDefault: i === 0,
    verified: true,
    createdAt: "2024-01-01T00:00:00Z",
  })),
];

function listWallets() {
  return [...wallets];
}

function registerWallet({ name, chain, address, setDefault }) {
  const resolved = resolveChain(chain);
  if (!resolved) {
    const err = new Error(`Unsupported chain: ${chain}`);
    err.statusCode = 400;
    throw err;
  }
  if (!address) {
    const err = new Error("Wallet address required");
    err.statusCode = 400;
    throw err;
  }

  const row = {
    id: `w_${crypto.randomBytes(3).toString("hex")}`,
    name: name || `${resolved.key} Wallet`,
    chain: resolved.key,
    address,
    isDefault: Boolean(setDefault),
    verified: true,
    createdAt: new Date().toISOString(),
  };

  if (row.isDefault) {
    wallets.forEach((w) => {
      w.isDefault = false;
    });
  }
  wallets.push(row);
  return row;
}

function setDefaultWallet(id) {
  const target = wallets.find((w) => w.id === id);
  if (!target) return null;
  wallets.forEach((w) => {
    w.isDefault = w.id === id;
  });
  return target;
}

module.exports = { listWallets, registerWallet, setDefaultWallet };
