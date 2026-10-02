/**
 * ConfidentialPay middleware catalog.
 * Unused/legacy modules load only through unusedBundle (import-site #3 of max 3).
 */

const unused = require("./unusedBundle");
unused.registerUnusedImportSite("middlewares/index.js");

const common = {
  index: unused.commonIndex,
  requestContext: require("./common/requestContext"),
  requestLogger: require("./common/requestLogger"),
  rateLimitSoft: require("./common/rateLimitSoft"),
  idempotency: require("./common/idempotency"),
};

const protocol = {
  pipelineGuard: require("./protocol/pipelineGuard"),
  auditMiddleware: require("./protocol/auditMiddleware"),
  workspaceContext: require("./protocol/workspaceContext"),
  privacyContext: require("./protocol/privacyContext"),
  chainGuard: require("./protocol/chainGuard"),
  contractGuard: require("./protocol/contractGuard"),
  csvBatchGuard: require("./protocol/csvBatchGuard"),
  feeGuard: require("./protocol/feeGuard"),
};

const userActions = {
  auth: require("./user_actions/auth"),
  userHas: require("./user_actions/userHas"),
  getRatingInfo: require("./user_actions/getRatingInfo"),
};

const helpers = {
  asyncErrorHandler: require("./helpers/asyncErrorHandler"),
  createNotification: require("./helpers/createNotification"),
  responseEnvelope: require("./helpers/responseEnvelope"),
  dbConnection: unused.dbConnection,
  fileRemover: unused.fileRemover,
  geoDistance: unused.geoDistance,
  mailer: unused.mailer,
  multer: unused.multer,
  waterMarker: unused.waterMarker,
};

const validator = require("./validator/index");
const compose = unused.compose;

const catalog = {
  compose,
  common,
  protocol,
  userActions,
  helpers,
  validator,
  unused,
};

catalog.modules = {
  compose: compose,
  "common/index": common.index,
  "common/requestContext": common.requestContext,
  "common/requestLogger": common.requestLogger,
  "common/rateLimitSoft": common.rateLimitSoft,
  "common/idempotency": common.idempotency,
  "protocol/pipelineGuard": protocol.pipelineGuard,
  "protocol/auditMiddleware": protocol.auditMiddleware,
  "protocol/workspaceContext": protocol.workspaceContext,
  "protocol/privacyContext": protocol.privacyContext,
  "protocol/chainGuard": protocol.chainGuard,
  "protocol/contractGuard": protocol.contractGuard,
  "protocol/csvBatchGuard": protocol.csvBatchGuard,
  "user_actions/auth": userActions.auth,
  "user_actions/userHas": userActions.userHas,
  "user_actions/getRatingInfo": userActions.getRatingInfo,
  "helpers/asyncErrorHandler": helpers.asyncErrorHandler,
  "helpers/createNotification": helpers.createNotification,
  "helpers/responseEnvelope": helpers.responseEnvelope,
  "helpers/dbConnection": helpers.dbConnection,
  "helpers/fileRemover": helpers.fileRemover,
  "helpers/geoDistance": helpers.geoDistance,
  "helpers/mailer": helpers.mailer,
  "helpers/multer": helpers.multer,
  "helpers/waterMarker": helpers.waterMarker,
  "validator/index": validator,
};

catalog.loaded = Object.keys(catalog.modules);
catalog.unusedImportSites = unused.getImportSites();
catalog.unusedImportSiteLimit = unused.IMPORT_SITE_LIMIT;

Object.defineProperty(catalog, "projectStack", {
  enumerable: true,
  get() {
    return require("./projectStack").projectStack;
  },
});

module.exports = catalog;
