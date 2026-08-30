const crypto = require("crypto");
const { treasuryBalances, transactions } = require("../../data/businessData");

function deposit({ amount, chain = "BNB", asset = "USDC" }) {
  const value = Number(amount) || 0;
  treasuryBalances.total += value;
  treasuryBalances.available += value;
  const token = treasuryBalances.tokens.find((t) => t.symbol === asset && t.chain === chain);
  if (token) {
    token.balance += value;
    token.value += value;
  } else {
    treasuryBalances.tokens.push({ symbol: asset, chain, balance: value, value });
  }
  const tx = {
    id: `0xdep_${crypto.randomBytes(3).toString("hex")}`,
    type: "deposit",
    amount: value,
    status: "completed",
    chain,
    date: new Date().toISOString(),
    fee: 0.5,
  };
  transactions.unshift(tx);
  return { balances: treasuryBalances, tx };
}

function withdraw({ amount, chain = "BNB", asset = "USDC", to }) {
  const value = Number(amount) || 0;
  if (value > treasuryBalances.available) {
    const err = new Error("Insufficient available treasury balance");
    err.statusCode = 400;
    throw err;
  }
  treasuryBalances.total -= value;
  treasuryBalances.available -= value;
  const token = treasuryBalances.tokens.find((t) => t.symbol === asset && t.chain === chain);
  if (token) {
    token.balance = Math.max(0, token.balance - value);
    token.value = Math.max(0, token.value - value);
  }
  const tx = {
    id: `0xwd_${crypto.randomBytes(3).toString("hex")}`,
    type: "withdraw",
    amount: value,
    status: "completed",
    chain,
    to: to || null,
    date: new Date().toISOString(),
    fee: 1.2,
  };
  transactions.unshift(tx);
  return { balances: treasuryBalances, tx };
}

module.exports = { deposit, withdraw };
