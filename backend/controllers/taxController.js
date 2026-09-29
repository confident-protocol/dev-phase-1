const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const {
  generateTaxDocument,
  listTaxDocuments,
  getTaxDocument,
} = require("../services/compliance/taxDocumentService");

exports.generate = asyncErrorHandler(async (req, res) => {
  try {
    const doc = generateTaxDocument(req.body || {});
    res.status(201).json({ success: true, document: doc });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    throw err;
  }
});

exports.list = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    items: listTaxDocuments({ employeeId: req.query.employeeId }),
  });
});

exports.getOne = asyncErrorHandler(async (req, res) => {
  const doc = getTaxDocument(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Tax document not found" });
  res.status(200).json({ success: true, document: doc });
});
