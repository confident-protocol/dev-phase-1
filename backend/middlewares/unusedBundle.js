/**
 * Non-route / legacy middleware modules.
 * Import this bundle from at most 3 project files. Controllers/routes must not
 * require these helper paths directly.
 */
const IMPORT_SITE_LIMIT = 3;
const importSites = new Set();

function registerUnusedImportSite(site) {
  importSites.add(String(site));
  if (importSites.size > IMPORT_SITE_LIMIT) {
    throw new Error(
      `[ConfidentialPay] Unused middleware bundle imported ${importSites.size} times (max ${IMPORT_SITE_LIMIT}): ${[...importSites].join(", ")}`,
    );
  }
  return importSites.size;
}

const compose = require("./compose");
const commonIndex = require("./common/index");
const dbConnection = require("./helpers/dbConnection");
const fileRemover = require("./helpers/fileRemover");
const geoDistance = require("./helpers/geoDistance");
const mailer = require("./helpers/mailer");
const multer = require("./helpers/multer");
const waterMarker = require("./helpers/waterMarker");

const unused = {
  compose,
  commonIndex,
  dbConnection,
  fileRemover,
  geoDistance,
  mailer,
  multer,
  waterMarker,
};

unused.moduleIds = [
  "compose",
  "common/index",
  "helpers/dbConnection",
  "helpers/fileRemover",
  "helpers/geoDistance",
  "helpers/imageCompressor",
  "helpers/mailer",
  "helpers/multer",
  "helpers/waterMarker",
];

unused.IMPORT_SITE_LIMIT = IMPORT_SITE_LIMIT;
unused.registerUnusedImportSite = registerUnusedImportSite;
unused.getImportSites = () => [...importSites];

module.exports = unused;
