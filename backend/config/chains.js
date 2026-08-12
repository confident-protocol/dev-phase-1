/**
 * Multi-VM chain registry for ConfidentialPay orchestrator.
 * Domains align with Circle CCTP + Hyperlane mailbox IDs used in settlement.
 */
const CHAINS = {
  ethereum: {
    key: "ETH",
    chainId: 1,
    cctpDomain: 0,
    hyperlaneDomain: 1,
    rpcEnv: "RPC_ETH",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    confirmations: 12,
    vm: "evm",
  },
  bnb: {
    key: "BNB",
    chainId: 56,
    cctpDomain: 7,
    hyperlaneDomain: 56,
    rpcEnv: "RPC_BNB",
    usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    confirmations: 15,
    vm: "evm",
  },
  base: {
    key: "BASE",
    chainId: 8453,
    cctpDomain: 6,
    hyperlaneDomain: 8453,
    rpcEnv: "RPC_BASE",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    confirmations: 8,
    vm: "evm",
  },
  arbitrum: {
    key: "ARB",
    chainId: 42161,
    cctpDomain: 3,
    hyperlaneDomain: 42161,
    rpcEnv: "RPC_ARB",
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    confirmations: 8,
    vm: "evm",
  },
  solana: {
    key: "SOL",
    chainId: 101,
    cctpDomain: 5,
    hyperlaneDomain: 1399811149,
    rpcEnv: "RPC_SOL",
    usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    confirmations: 32,
    vm: "svm",
  },
  polygon: {
    key: "MATIC",
    chainId: 137,
    cctpDomain: 7,
    hyperlaneDomain: 137,
    rpcEnv: "RPC_POLYGON",
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    confirmations: 128,
    vm: "evm",
  },
};

function resolveChain(input) {
  if (!input) return null;
  const normalized = String(input).trim().toLowerCase();
  if (CHAINS[normalized]) return CHAINS[normalized];
  return Object.values(CHAINS).find((c) => c.key.toLowerCase() === normalized || String(c.chainId) === normalized) || null;
}

function listSupportedChains() {
  return Object.values(CHAINS).map((c) => ({
    key: c.key,
    chainId: c.chainId,
    vm: c.vm,
    cctpDomain: c.cctpDomain,
    hyperlaneDomain: c.hyperlaneDomain,
    usdc: c.usdc,
  }));
}

module.exports = { CHAINS, resolveChain, listSupportedChains };
