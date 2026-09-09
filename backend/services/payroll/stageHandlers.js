const crypto = require("crypto");
const { generateProof } = require("../zk/ligeroProofService");
const { initiateBurn, attachAttestation, mintOnDestination } = require("../bridge/cctpBridgeService");
const { dispatchStateSync } = require("../bridge/hyperlaneRelayer");
const { buildRosterRoot } = require("../fhe/encryptedRoster");

async function stageSourceDeposit(ctx) {
  ctx.depositTx = `0xdep_${crypto.randomBytes(8).toString("hex")}`;
  ctx.notes.push(`Deposited ${ctx.amount} USDC on ${ctx.sourceChain}`);
  return { ok: true, depositTx: ctx.depositTx };
}

async function stageZkProof(ctx) {
  const roster = buildRosterRoot(ctx.employeeIds);
  ctx.rosterRoot = roster.root;
  const proof = await generateProof(
    "payroll_batch_v3",
    { employeeIds: ctx.employeeIds, amount: ctx.amount },
    {
      rosterRoot: roster.root,
      nullifierSetHash: crypto.createHash("sha256").update(ctx.pipelineId).digest("hex"),
      feeBps: ctx.feeBps,
      chainDomain: ctx.sourceChain,
    }
  );
  ctx.zkProofId = proof.proofId;
  ctx.notes.push(`ZK proof ${proof.proofId} generated in ${proof.proveMs}ms`);
  return { ok: true, proofId: proof.proofId, rosterRoot: roster.root };
}

async function stageStableSwap(ctx) {
  ctx.swapQuote = {
    venue: "uniswap-trading-api",
    from: ctx.sourceAsset || "USDC",
    to: "USDC",
    amountIn: ctx.amount,
    amountOut: ctx.amount,
    slippageBps: 5,
  };
  ctx.notes.push("Stable swap quote locked (USDC identity path)");
  return { ok: true, swapQuote: ctx.swapQuote };
}

async function stageCctpBridge(ctx) {
  const burn = initiateBurn({
    sourceChain: ctx.sourceChain,
    destChain: ctx.destChain,
    amount: ctx.amount,
    sender: ctx.treasuryWallet || "0xTreasury",
  });
  const attested = attachAttestation(burn.burnId);
  const minted = mintOnDestination(attested.attestation.attestationHash, ctx.shieldedPool || "0xShieldedPool");
  ctx.cctp = { burn, attestation: attested.attestation, mint: minted };
  const sync = dispatchStateSync({
    sourceChain: ctx.sourceChain,
    destChain: ctx.destChain,
    body: { pipelineId: ctx.pipelineId, rosterRoot: ctx.rosterRoot },
    recipient: "0xSett1eCCTP00000000000000000000000000001",
  });
  ctx.hyperlaneMessageId = sync.messageId;
  ctx.notes.push(`CCTP burn/mint completed; Hyperlane sync ${sync.messageId}`);
  return { ok: true, cctp: ctx.cctp, hyperlaneMessageId: sync.messageId };
}

async function stageShieldedDeposit(ctx) {
  const commitment = `0x${crypto.createHash("sha256").update(ctx.pipelineId + "deposit").digest("hex")}`;
  const proof = await generateProof(
    "shielded_deposit_v2",
    { commitment, amount: ctx.amount },
    {
      commitment,
      amountCommitment: crypto.createHash("sha256").update(String(ctx.amount)).digest("hex"),
      cctpAttestationHash: ctx.cctp?.attestation?.attestationHash,
    }
  );
  ctx.shieldCommitment = commitment;
  ctx.shieldDepositProofId = proof.proofId;
  ctx.notes.push(`Shielded deposit commitment ${commitment.slice(0, 18)}…`);
  return { ok: true, commitment, proofId: proof.proofId };
}

async function stagePrivateTransfer(ctx) {
  const nullifier = `0x${crypto.createHash("sha256").update(ctx.pipelineId + "null").digest("hex")}`;
  const newCommitment = `0x${crypto.createHash("sha256").update(ctx.pipelineId + "recv").digest("hex")}`;
  const proof = await generateProof(
    "private_transfer_v2",
    { nullifier, newCommitment, recipients: ctx.recipients || [] },
    { nullifier, newCommitment, merkleRoot: ctx.rosterRoot }
  );
  ctx.nullifier = nullifier;
  ctx.transferProofId = proof.proofId;
  ctx.notes.push("Private transfer nullifier spent");
  return { ok: true, nullifier, proofId: proof.proofId };
}

async function stageDestWithdraw(ctx) {
  ctx.withdrawTx = `0xwd_${crypto.randomBytes(8).toString("hex")}`;
  ctx.exitAsset = ctx.exitAsset || "USDC";
  ctx.notes.push(`Destination withdrawal as ${ctx.exitAsset}`);
  return { ok: true, withdrawTx: ctx.withdrawTx, exitAsset: ctx.exitAsset };
}

const STAGE_HANDLERS = {
  source_deposit: stageSourceDeposit,
  zk_proof: stageZkProof,
  stable_swap: stageStableSwap,
  cctp_bridge: stageCctpBridge,
  shielded_deposit: stageShieldedDeposit,
  private_transfer: stagePrivateTransfer,
  dest_withdraw: stageDestWithdraw,
};

module.exports = { STAGE_HANDLERS };
