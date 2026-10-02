const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { listWallets, registerWallet, setDefaultWallet } = require("../services/wallets/walletRegistry");

exports.list = asyncErrorHandler(async (req, res) => {
  res.status(200).json({ success: true, items: listWallets() });
});

exports.register = asyncErrorHandler(async (req, res) => {
  try {
    const wallet = registerWallet(req.body || {});
    res.status(201).json({ success: true, wallet });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    throw err;
  }
});

exports.setDefault = asyncErrorHandler(async (req, res) => {
  const wallet = setDefaultWallet(req.params.id);
  if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });
  res.status(200).json({ success: true, wallet });
});
