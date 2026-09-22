const crypto = require("crypto");
const { PROTOCOL } = require("../../config/protocol");
const { STAGE_HANDLERS } = require("./stageHandlers");

const pipelines = new Map();

function createPipelineContext(input = {}) {
  const pipelineId = `pipe_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`;
  const feeBps = Math.min(
    PROTOCOL.fees.maxBps,
    Math.max(PROTOCOL.fees.minBps, Number(input.feeBps) || PROTOCOL.fees.defaultBps)
  );
  const fee = Number(((Number(input.amount) || 0) * feeBps) / 10_000).toFixed(6);

  return {
    pipelineId,
    status: "queued",
    currentStage: 0,
    amount: Number(input.amount) || 0,
    feeBps,
    fee: Number(fee),
    sourceChain: input.sourceChain || "BNB",
    destChain: input.destChain || "ETH",
    sourceAsset: input.sourceAsset || "USDC",
    exitAsset: input.exitAsset || "USDC",
    employeeIds: input.employeeIds || [],
    recipients: input.recipients || [],
    treasuryWallet: input.treasuryWallet,
    templateId: input.templateId,
    stages: PROTOCOL.pipeline.stages.map((s) => ({
      ...s,
      status: "pending",
      startedAt: null,
      finishedAt: null,
      result: null,
      error: null,
    })),
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function advanceStage(pipelineId) {
  const ctx = pipelines.get(pipelineId);
  if (!ctx) return null;
  if (ctx.status === "completed" || ctx.status === "failed") return ctx;

  const nextIndex = ctx.currentStage;
  if (nextIndex >= ctx.stages.length) {
    ctx.status = "completed";
    ctx.updatedAt = new Date().toISOString();
    return ctx;
  }

  const stage = ctx.stages[nextIndex];
  const handler = STAGE_HANDLERS[stage.key];
  stage.status = "running";
  stage.startedAt = new Date().toISOString();
  ctx.status = "running";
  ctx.updatedAt = new Date().toISOString();

  try {
    const result = await handler(ctx);
    stage.result = result;
    stage.status = "completed";
    stage.finishedAt = new Date().toISOString();
    ctx.currentStage = nextIndex + 1;
    if (ctx.currentStage >= ctx.stages.length) {
      ctx.status = "completed";
      ctx.completedAt = new Date().toISOString();
    }
  } catch (err) {
    stage.status = "failed";
    stage.error = err.message;
    stage.finishedAt = new Date().toISOString();
    ctx.status = "failed";
    ctx.failedAt = new Date().toISOString();
  }

  ctx.updatedAt = new Date().toISOString();
  return ctx;
}

async function runPipelineToCompletion(input = {}) {
  const ctx = createPipelineContext(input);
  pipelines.set(ctx.pipelineId, ctx);
  while (ctx.status !== "completed" && ctx.status !== "failed") {
    await advanceStage(ctx.pipelineId);
  }
  return ctx;
}

async function startPipeline(input = {}) {
  const ctx = createPipelineContext(input);
  pipelines.set(ctx.pipelineId, ctx);
  await advanceStage(ctx.pipelineId);
  return ctx;
}

function getPipeline(pipelineId) {
  return pipelines.get(pipelineId) || null;
}

function listPipelines() {
  return [...pipelines.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

module.exports = {
  createPipelineContext,
  startPipeline,
  advanceStage,
  runPipelineToCompletion,
  getPipeline,
  listPipelines,
};
