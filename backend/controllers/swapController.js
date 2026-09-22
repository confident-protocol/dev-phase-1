const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { getQuote, executeSwap } = require("../services/swap/uniswapQuoteService");

exports.quote = asyncErrorHandler(async (req, res) => {
  const quote = getQuote(req.body || req.query || {});
  res.status(200).json({ success: true, quote });
});

exports.execute = asyncErrorHandler(async (req, res) => {
  const result = executeSwap(req.body?.quoteId || req.params.quoteId);
  if (!result) return res.status(404).json({ success: false, message: "Quote not found or expired" });
  res.status(200).json({ success: true, swap: result });
});
