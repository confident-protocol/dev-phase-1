function parseBatchRecipients(req, res, next) {
  const raw = req.body?.recipientsCsv || req.body?.csv;
  if (!raw || typeof raw !== "string") return next();

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^wallet[,;]/i.test(l));

  const recipients = [];
  for (const line of lines) {
    const [wallet, amount, chain] = line.split(/[,;]/).map((p) => p.trim());
    if (!wallet) continue;
    recipients.push({
      wallet,
      amount: amount ? Number(amount) : undefined,
      chain: chain || req.body?.destChain || "ETH",
    });
  }

  req.body.recipients = recipients;
  req.batchMeta = { source: "csv", count: recipients.length };
  next();
}

function requireBatchNotEmpty(req, res, next) {
  if (req.batchMeta && req.batchMeta.count === 0) {
    return res.status(400).json({ success: false, message: "CSV batch contained no recipients" });
  }
  next();
}

module.exports = { parseBatchRecipients, requireBatchNotEmpty };
