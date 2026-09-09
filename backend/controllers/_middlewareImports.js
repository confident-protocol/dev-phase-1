/**
 * Shared controller-facing middleware imports.
 * Unused/legacy middleware modules are loaded only via unusedBundle
 * (import-site #2 of max 3 — do not add more unused require sites).
 */
const unused = require("../middlewares/unusedBundle");
unused.registerUnusedImportSite("controllers/_middlewareImports.js");

const requestContext = require("../middlewares/common/requestContext");
const requestLogger = require("../middlewares/common/requestLogger");
const rateLimitSoft = require("../middlewares/common/rateLimitSoft");
const idempotency = require("../middlewares/common/idempotency");
const pipelineGuard = require("../middlewares/protocol/pipelineGuard");
const auditMiddleware = require("../middlewares/protocol/auditMiddleware");
const workspaceContext = require("../middlewares/protocol/workspaceContext");
const privacyContext = require("../middlewares/protocol/privacyContext");
const chainGuard = require("../middlewares/protocol/chainGuard");
const contractGuard = require("../middlewares/protocol/contractGuard");
const csvBatchGuard = require("../middlewares/protocol/csvBatchGuard");
const feeGuard = require("../middlewares/protocol/feeGuard");
const auth = require("../middlewares/user_actions/auth");
const userHas = require("../middlewares/user_actions/userHas");
const getRatingInfo = require("../middlewares/user_actions/getRatingInfo");
const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const createNotification = require("../middlewares/helpers/createNotification");
const responseEnvelope = require("../middlewares/helpers/responseEnvelope");
const validator = require("../middlewares/validator/index");

module.exports = {
  // unused (bundled — max 3 import sites project-wide)
  compose: unused.compose,
  commonIndex: unused.commonIndex,
  dbConnection: unused.dbConnection,
  fileRemover: unused.fileRemover,
  geoDistance: unused.geoDistance,
  imageCompressor: unused.imageCompressor,
  mailer: unused.mailer,
  multer: unused.multer,
  waterMarker: unused.waterMarker,

  // actively used middleware modules
  requestContext,
  requestLogger,
  rateLimitSoft,
  idempotency,
  pipelineGuard,
  auditMiddleware,
  workspaceContext,
  privacyContext,
  chainGuard,
  contractGuard,
  csvBatchGuard,
  feeGuard,
  auth,
  userHas,
  getRatingInfo,
  asyncErrorHandler,
  createNotification,
  responseEnvelope,
  validator,
};
