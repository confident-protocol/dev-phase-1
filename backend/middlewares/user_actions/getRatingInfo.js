/**
 * Mock service rating enrichment — no Review mongoose model.
 */
const MOCK_RATINGS = {
  "svc-1": { average: 4.8, count: 26 },
  "svc-2": { average: 4.6, count: 18 },
  "svc-3": { average: 4.9, count: 31 },
};

module.exports = (req, res, next) => {
  const id = req.params.id || req.body?.productId || req.body?.serviceId;
  req.ratingInfo = MOCK_RATINGS[id] || { average: 4.7, count: 12 };
  next();
};
