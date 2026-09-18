const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { listDeployments, getDeployment, protocolSnapshot, loadAbi } = require("../services/contracts/contractRegistry");
const crypto = require("crypto");

const simulatedTxs = [];

exports.listContracts = (req, res) => {
  res.status(200).json({ success: true, contracts: listDeployments() });
};

exports.getContract = (req, res) => {
  const deployment = getDeployment(req.params.name, req.query.chain);
  if (!deployment) return res.status(404).json({ success: false, message: "Contract not found" });
  res.status(200).json({ success: true, contract: deployment });
};

exports.getAbi = (req, res) => {
  const abi = loadAbi(req.params.name);
  if (!abi?.length) return res.status(404).json({ success: false, message: "ABI not found" });
  res.status(200).json({ success: true, name: req.params.name, abi });
};

exports.simulateCall = (req, res) => {
  const { name, method, args, chain } = req.body || {};
  const deployment = getDeployment(name, chain);
  if (!deployment) return res.status(404).json({ success: false, message: "Contract not found" });

  const tx = {
    id: `sim_${crypto.randomBytes(4).toString("hex")}`,
    contract: name,
    address: deployment.address,
    chain: deployment.chain,
    method: method || "runPayroll",
    args: args || [],
    status: "simulated",
    txHash: `0x${crypto.randomBytes(16).toString("hex")}`,
    createdAt: new Date().toISOString(),
  };
  simulatedTxs.unshift(tx);
  res.status(200).json({ success: true, tx, protocol: protocolSnapshot().version });
};

exports.listSimulatedTxs = (req, res) => {
  res.status(200).json({ success: true, items: simulatedTxs });
};
