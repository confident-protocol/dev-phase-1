const crypto = require("crypto");

const quotes = new Map();

function getQuote({ fromAsset = "ETH", toAsset = "USDC", amount = 0, chain = "ETH" }) {
  const amountIn = Number(amount) || 0;
  const rate = fromAsset === toAsset ? 1 : fromAsset === "ETH" ? 3000 : fromAsset === "BNB" ? 600 : 1;
  const amountOut = fromAsset === toAsset ? amountIn : Number((amountIn * rate * 0.997).toFixed(6));
  const quoteId = `uq_${crypto.randomBytes(4).toString("hex")}`;
  const quote = {
    quoteId,
    venue: "uniswap-trading-api",
    chain,
    fromAsset,
    toAsset,
    amountIn,
    amountOut,
    slippageBps: 30,
    priceImpactBps: 8,
    route: fromAsset === toAsset ? [fromAsset] : [fromAsset, toAsset],
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  quotes.set(quoteId, quote);
  return quote;
}

function executeSwap(quoteId) {
  const quote = quotes.get(quoteId);
  if (!quote) return null;
  return {
    ...quote,
    status: "filled",
    txHash: `0xswap_${crypto.randomBytes(8).toString("hex")}`,
    executedAt: new Date().toISOString(),
  };
}

module.exports = { getQuote, executeSwap };
