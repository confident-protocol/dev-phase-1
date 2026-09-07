const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Load every middleware module and mount them on the live request pipeline.
const middlewareCatalog = require("./middlewares");
const { projectStack } = require("./middlewares/projectStack");
app.locals.middlewareCatalog = middlewareCatalog;
app.locals.middlewareProjectStackSize = projectStack.length;

const { attachProtocolHeaders } = middlewareCatalog.protocol.pipelineGuard;
const { attachRequestId, attachClientMeta, attachTimestamp } = middlewareCatalog.common.requestContext;
const { requestLogger, slowRequestFlag } = middlewareCatalog.common.requestLogger;
const { softRateLimit } = middlewareCatalog.common.rateLimitSoft;
const { auditRequest } = middlewareCatalog.protocol.auditMiddleware;
const { successEnvelope } = middlewareCatalog.helpers.responseEnvelope;

app.use(attachRequestId);
app.use(attachClientMeta);
app.use(attachTimestamp);
app.use(requestLogger);
app.use(slowRequestFlag(2000));
app.use(attachProtocolHeaders);
app.use(softRateLimit({ max: 600, windowMs: 60_000 }));
app.use(auditRequest("http_request"));
app.use(successEnvelope);

// Mount full middleware catalog on API traffic (every module participates).
app.use("/api", ...projectStack);
app.use("/api/v1", ...projectStack);

const user = require("./routes/userRoute");
const product = require("./routes/productRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");

// MVP domain routers (mounted before business aliases where overlap exists)
const mvp = require("./routes/mvpRoute");
const protocol = require("./routes/protocolRoute");
const payrollPipeline = require("./routes/payrollPipelineRoute");
const employees = require("./routes/employeeRoute");
const templates = require("./routes/templateRoute");
const schedules = require("./routes/scheduleRoute");
const settings = require("./routes/settingsRoute");
const zk = require("./routes/zkRoute");
const fhe = require("./routes/fheRoute");
const bridge = require("./routes/bridgeRoute");
const contracts = require("./routes/contractRoute");
const compliance = require("./routes/complianceRoute");
const treasury = require("./routes/treasuryRoute");
const wallets = require("./routes/walletRoute");
const swap = require("./routes/swapRoute");
const tax = require("./routes/taxRoute");
const agents = require("./routes/agentRoute");
const notifications = require("./routes/notificationRoute");
const workspace = require("./routes/workspaceRoute");
const settlements = require("./routes/settlementRoute");
const business = require("./routes/businessRoute");

const mvpRouters = [
  mvp,
  protocol,
  payrollPipeline,
  employees,
  templates,
  schedules,
  settings,
  zk,
  fhe,
  bridge,
  contracts,
  compliance,
  treasury,
  wallets,
  swap,
  tax,
  agents,
  notifications,
  workspace,
  settlements,
];

app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", order);
app.use("/api/v1", payment);

for (const router of mvpRouters) {
  app.use("/api", router);
  app.use("/api/v1", router);
}

// Frontend-compatible business aliases last (dashboard/auth/payroll shortcuts)
app.use("/api", business);

app.get("/", (req, res) => {
  res.json({
    service: "ConfidentialPay API Orchestrator",
    status: "running",
    phase: "MVP",
    dataMode: "mock",
    middlewareModulesLoaded: middlewareCatalog.loaded.length,
    middlewareProjectStackSize: projectStack.length,
    unusedMiddlewareImportSites: middlewareCatalog.unusedImportSites,
    unusedMiddlewareImportSiteLimit: middlewareCatalog.unusedImportSiteLimit,
    middlewareModules: middlewareCatalog.loaded,
    docs: {
      mvp: "/api/mvp/capabilities",
      status: "/api/mvp/status",
      protocol: "/api/protocol",
      employees: "/api/employees",
      payrollExecute: "/api/payroll/execute",
      pipeline: "/api/pipeline/start",
      contracts: "/api/contracts",
      zk: "/api/zk/circuits",
      fhe: "/api/fhe/roster",
      bridge: "/api/bridge",
      treasury: "/api/treasury/balances",
      compliance: "/api/compliance/score",
      wallets: "/api/wallets",
      swap: "/api/swap/quote",
      tax: "/api/tax/documents",
    },
  });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Orchestrator error",
    requestId: req.requestId,
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(path.resolve(), "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(path.resolve(), "dist", "index.html"));
  });
}

module.exports = app;
