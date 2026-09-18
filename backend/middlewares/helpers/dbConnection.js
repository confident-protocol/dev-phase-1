/**
 * Legacy DB connector stub. No MongoDB / Mongoose / Fawn.
 */
module.exports = () => {
  console.log("[ConfidentialPay] Skipping DB connection (mock data mode)");
  return {
    Task: class MockTask {
      constructor() {}
      update() { return this; }
      save() { return this; }
      remove() { return this; }
      run() { return Promise.resolve([]); }
    },
  };
};
