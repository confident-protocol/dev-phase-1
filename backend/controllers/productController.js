const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const {projectStack} = require("../middlewares/projectStack");
const {dbErrorHandler} = require("../middlewares/helpers/dbErrorHandler");
const ErrorHandler = require("../utils/errorHandler");
const { services } = require("../data/businessData");
const { PROTOCOL } = require("../config/protocol");

function findService(id) {
  return services.find((item) => item.id === id) || null;
}

function asCatalogItem(service) {
  return {
    ...service,
    kind: "protocol_service",
    billing: "enterprise_saas",
    privacyStack: [PROTOCOL.privacy.zkProvider, PROTOCOL.privacy.fheProvider],
  };
}

// Enterprise service catalog (not retail products)
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
  const catalog = services.map(asCatalogItem);
  res.status(200).json({
    success: true,
    products: catalog,
    services: catalog,
    productsCount: catalog.length,
    resultPerPage: catalog.length,
    filteredProductsCount: catalog.length,
  });
});

exports.getProducts = asyncErrorHandler(async (req, res, next) => {
  const catalog = services.map(asCatalogItem);
  res.status(200).json({ success: true, products: catalog, services: catalog });
});

exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
  const product = findService(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Protocol service not found", 404));
  }
  res.status(200).json({ success: true, product: asCatalogItem(product) });
});

exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({ success: true, products: services.map(asCatalogItem) });
});

exports.createProduct = asyncErrorHandler(async (req, res, next) => {
  const product = {
    id: `svc-${Date.now()}`,
    name: req.body?.name || "New ConfidentialPay Capability",
    category: req.body?.category || "Operations",
    description: req.body?.description || "Configured from the protocol admin console",
    price: req.body?.price || 0,
    active: true,
  };
  res.status(201).json({ success: true, product: asCatalogItem(product) });
});

exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
  const existing = findService(req.params.id);
  if (!existing) {
    return next(new ErrorHandler("Protocol service not found", 404));
  }
  res.status(200).json({ success: true, product: asCatalogItem({ ...existing, ...req.body }) });
});

exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: "Protocol service removed from enterprise catalog" });
});

exports.createProductReview = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: "Capability feedback queued for protocol ops" });
});

exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({ success: true, reviews: [] });
});

exports.deleteReview = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: "Feedback removed" });
});
