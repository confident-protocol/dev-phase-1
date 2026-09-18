/**
 * Database bootstrap intentionally disabled.
 * ConfidentialPay demo/orchestrator uses in-memory mock data only.
 */
const connectDatabase = () => {
  console.log("[ConfidentialPay] Mock data mode — MongoDB/Mongoose disabled");
  return null;
};

module.exports = connectDatabase;
