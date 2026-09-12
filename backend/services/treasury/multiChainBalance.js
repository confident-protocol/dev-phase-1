const { treasuryBalances } = require("../../data/businessData");
const { listSupportedChains } = require("../../config/chains");

function getAggregatedTreasury() {
  const byChain = {};
  for (const token of treasuryBalances.tokens) {
    if (!byChain[token.chain]) byChain[token.chain] = { chain: token.chain, value: 0, tokens: [] };
    byChain[token.chain].value += token.value;
    byChain[token.chain].tokens.push(token);
  }
  return {
    ...treasuryBalances,
    byChain: Object.values(byChain),
    supportedChains: listSupportedChains().map((c) => c.key),
    policy: {
      maxSingleTransfer: 250000,
      requireDualControlAbove: 100000,
      privacyMode: "zk+fhe",
    },
  };
}

function simulateRebalance({ fromChain, toChain, amount }) {
  return {
    status: "queued",
    fromChain,
    toChain,
    amount,
    route: ["treasury_vault", "cctp", "dest_vault"],
    estimatedFee: Number((amount * 0.0008).toFixed(4)),
    createdAt: new Date().toISOString(),
  };
}

module.exports = { getAggregatedTreasury, simulateRebalance };
