const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const {
  upsertEmployeeCipher,
  buildRosterRoot,
  getEmployeeCipher,
  listRoster,
  encryptSalary,
} = require("../services/fhe/encryptedRoster");
const { createIncomeThresholdRequest, getIncomeRequest } = require("../services/fhe/incomeProverService");

exports.encryptSalary = (req, res) => {
  const { salary, aclSubjects } = req.body || {};
  const micro = Math.round(Number(salary || 0) * 1_000_000);
  res.status(200).json({ success: true, cipher: encryptSalary(micro, aclSubjects || []) });
};

exports.upsertRosterLeaf = (req, res) => {
  const leaf = upsertEmployeeCipher(req.body || {});
  res.status(200).json({ success: true, leaf, merkle: buildRosterRoot() });
};

exports.getRoster = (req, res) => {
  res.status(200).json({ success: true, items: listRoster(), merkle: buildRosterRoot() });
};

exports.getEmployeeCipher = (req, res) => {
  const leaf = getEmployeeCipher(req.params.employeeId);
  if (!leaf) return res.status(404).json({ success: false, message: "Cipher not found" });
  res.status(200).json({ success: true, leaf });
};

exports.requestIncomeProof = async (req, res, next) => {
  try {
    const record = await createIncomeThresholdRequest(req.body || {});
    res.status(201).json({ success: true, proofRequest: record });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
};

exports.getIncomeProof = (req, res) => {
  const record = getIncomeRequest(req.params.requestId);
  if (!record) return res.status(404).json({ success: false, message: "Request not found" });
  res.status(200).json({ success: true, proofRequest: record });
};
