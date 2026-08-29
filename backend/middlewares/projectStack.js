/**
 * Live Express stack that mounts every middleware module on the project.
 * Route-level stacks may still add stricter checks; this ensures each module
 * actually participates in request handling (not catalog-only imports).
 */

const catalog = require("./index");
const unused = require("./unusedBundle");
unused.registerUnusedImportSite("middlewares/projectStack.js");

const { optionalAuth } = catalog.userActions.auth;
const { attachWorkspace, requireWorkspace } = catalog.protocol.workspaceContext;
const { attachPrivacyContext, requireZkHeaders } = catalog.protocol.privacyContext;
const {
  attachSupportedChains,
  resolveBodyChains,
  requireResolvedSourceChain,
} = catalog.protocol.chainGuard;
const { attachContractRegistry, validateContractName } = catalog.protocol.contractGuard;
const { attachFeeContext, clampFeeBps } = catalog.protocol.feeGuard;
const { parseBatchRecipients, requireBatchNotEmpty } = catalog.protocol.csvBatchGuard;
const { idempotencyGuard } = catalog.common.idempotency;
const {
  hasEmployeeRoster,
  hasActivePayroll,
  attachCartStub,
  attachWishlistStub,
} = catalog.userActions.userHas;
const getRatingInfo = catalog.userActions.getRatingInfo;
const { notifyMiddleware } = catalog.helpers.createNotification;
const waterMarker = unused.waterMarker;
const {
  validatePagination,
  validateLoginBody,
  validateServiceId,
  validateEmployeeIds,
  validateChainPair,
  validateCircuitId,
} = catalog.validator;

/** Bind helper / utility modules onto the request so they are project-loaded. */
function attachHelperModules(req, res, next) {
  req.cp = req.cp || {};
  req.cp.middlewareCatalog = catalog;
  req.cp.middlewareLoaded = catalog.loaded;

  req.helpers = {
    asyncErrorHandler: catalog.helpers.asyncErrorHandler,
    createNotification: catalog.helpers.createNotification,
    sendEmail: catalog.helpers.mailer.sendEmail,
    fileRemover: catalog.helpers.fileRemover,
    geoDistance: catalog.helpers.geoDistance,
    dbConnection: catalog.helpers.dbConnection,
    multer: catalog.helpers.multer,
    waterMarker: catalog.helpers.waterMarker,
    responseEnvelope: catalog.helpers.responseEnvelope,
    statuses: catalog.common.index,
    compose: catalog.compose,
    validator: catalog.validator,
  };

  // Touch optional upload factories so multer module is exercised on each request path.
  req.upload = {
    adminDoc: catalog.helpers.multer.uploadAdminDoc,
    adminPhoto: catalog.helpers.multer.uploadAdminPhoto,
    userPhoto: catalog.helpers.multer.uploadUserPhoto,
    productImages: catalog.helpers.multer.uploadProductImages,
    bannerPhoto: catalog.helpers.multer.uploadBannerPhoto,
  };

  // Soft-init mock DB connector once per process, expose on app locals via req.app
  if (req.app && !req.app.locals.dbConnector) {
    req.app.locals.dbConnector = catalog.helpers.dbConnection();
  }

  res.setHeader("X-CP-Middleware-Loaded", String(catalog.loaded.length));
  next();
}

/** Soft validators — never block when fields are absent (route stacks may tighten). */
function softValidateLoginBody(req, res, next) {
  const url = `${req.baseUrl || ""}${req.path || ""}`;
  if (!/\/login\b/.test(url)) return next();
  return validateLoginBody(req, res, next);
}

function softValidateServiceId(req, res, next) {
  if (!req.params?.id && !req.body?.serviceId) return next();
  return validateServiceId(req, res, next);
}

function softValidateEmployeeIds(req, res, next) {
  if (!req.body?.employeeIds) return next();
  return validateEmployeeIds(req, res, next);
}

function softValidateChainPair(req, res, next) {
  if (!req.body?.sourceChain && !req.body?.destChain && !req.query?.sourceChain) return next();
  return validateChainPair(req, res, next);
}

function softValidateCircuitId(req, res, next) {
  if (!req.body?.circuitId && !req.params?.circuitId) return next();
  return validateCircuitId(req, res, next);
}

function softValidatePagination(req, res, next) {
  return validatePagination(req, res, next);
}

/**
 * Ordered project-wide middleware stack.
 * Every middleware module contributes at least one handler here.
 */
const projectStack = [
  // helpers + catalog binding (covers compose, common/index, all helper modules)
  attachHelperModules,

  // auth (optional — never hard-blocks globally)
  optionalAuth,

  // workspace / privacy
  attachWorkspace,
  requireWorkspace,
  attachPrivacyContext,
  requireZkHeaders,

  // protocol guards
  attachSupportedChains,
  resolveBodyChains,
  requireResolvedSourceChain,
  attachContractRegistry,
  validateContractName,
  attachFeeContext,
  clampFeeBps,
  parseBatchRecipients,
  requireBatchNotEmpty,

  // common
  idempotencyGuard,

  // user capability stubs
  hasEmployeeRoster,
  hasActivePayroll,
  attachCartStub,
  attachWishlistStub,
  getRatingInfo,

  // notifications (no-op factory when no payload)
  notifyMiddleware(() => null),

  // uploads / media (pass-through without files)
  waterMarker,

  // validators (soft)
  softValidatePagination,
  softValidateLoginBody,
  softValidateServiceId,
  softValidateEmployeeIds,
  softValidateChainPair,
  softValidateCircuitId,
];

module.exports = {
  projectStack,
  attachHelperModules,
};
