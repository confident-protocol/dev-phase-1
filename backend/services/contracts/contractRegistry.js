const fs = require("fs");
const path = require("path");
const { PROTOCOL } = require("../../config/protocol");
const { listSupportedChains } = require("../../config/chains");

const ABI_DIR = path.join(__dirname, "abi");

const MINIMAL_ABIS = {
  ConfidentialPayroll: [
    "function batchAddEmployees(address[] wallets,bytes32[] nameHashes,bytes32[] roleHashes,bytes32[] salaryCiphers,bytes[] fheProofs,uint64[] chainIdHints)",
    "function runPayroll(bytes32 runId,bytes32 rosterRoot,bytes zkProof,bytes32[] publicInputs,uint64 sourceChainId,uint64 destChainId)",
    "function getSalaryCipher(uint256 id) view returns (bytes32)",
    "function grantSelectiveDisclosure(uint256 id,address viewer,uint256 ttl)",
    "event PayrollExecuted(bytes32 indexed runId,bytes32 rosterRoot,uint256 employeeCount)",
  ],
  ShieldedPool: [
    "function deposit(bytes32 commitment,bytes zkProof,bytes32[] publicInputs,bytes32 newRoot)",
    "function privateTransfer(bytes32 nullifier,bytes32 newCommitment,address recipient,bytes zkProof,bytes32[] publicInputs,bytes32 newRoot)",
  ],
  CrossChainSettlement: [
    "function consumeCctpAttestation(bytes message,bytes attestation,uint32 sourceDomain,uint256 amount) returns (bytes32)",
    "function dispatchHyperlane(uint32 destDomain,bytes32 recipient,bytes body) returns (bytes32)",
  ],
  IncomeProver: [
    "function requestIncomeThresholdProof(bytes32 requestId,address subject,bytes32 salaryCipher,bytes32 thresholdCipher,bytes zkProof,bytes32[] publicInputs)",
  ],
  ZKVerifier: ["function verify(bytes proof,bytes32[] publicInputs) view returns (bool)"],
};

function loadAbi(name) {
  const file = path.join(ABI_DIR, `${name}.json`);
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (_) {
      /* fall through */
    }
  }
  return MINIMAL_ABIS[name] || [];
}

function listDeployments() {
  return Object.entries(PROTOCOL.contracts).map(([name, byChain]) => ({
    name,
    abi: loadAbi(name),
    deployments: Object.entries(byChain).map(([chain, address]) => ({ chain, address })),
    source: `contracts/${name}.sol`,
  }));
}

function getDeployment(name, chain) {
  const byChain = PROTOCOL.contracts[name];
  if (!byChain) return null;
  const address = byChain[chain] || Object.values(byChain)[0];
  return {
    name,
    chain: byChain[chain] ? chain : Object.keys(byChain)[0],
    address,
    abi: loadAbi(name),
    protocolVersion: PROTOCOL.version,
  };
}

function protocolSnapshot() {
  return {
    protocol: PROTOCOL.name,
    version: PROTOCOL.version,
    privacy: PROTOCOL.privacy,
    fees: PROTOCOL.fees,
    pipelineStages: PROTOCOL.pipeline.stages,
    compliance: PROTOCOL.compliance,
    chains: listSupportedChains(),
    contracts: listDeployments(),
  };
}

module.exports = {
  listDeployments,
  getDeployment,
  protocolSnapshot,
  loadAbi,
};
