const crypto = require("crypto");

const screens = new Map();

function screenParty({ partyId, wallet, type = "employee" }) {
  const screenId = `aml_${crypto.randomBytes(4).toString("hex")}`;
  const riskScore = (parseInt(crypto.createHash("md5").update(wallet || partyId || "").digest("hex").slice(0, 2), 16) % 30);
  const record = {
    screenId,
    partyId,
    wallet,
    type,
    riskScore,
    sanctionsHit: false,
    pepHit: false,
    status: riskScore > 25 ? "manual_review" : "cleared",
    provider: "confidentialpay-compliance-mesh",
    checkedAt: new Date().toISOString(),
  };
  screens.set(screenId, record);
  return record;
}

function getScreen(screenId) {
  return screens.get(screenId) || null;
}

function listScreens() {
  return [...screens.values()];
}

module.exports = { screenParty, getScreen, listScreens };
