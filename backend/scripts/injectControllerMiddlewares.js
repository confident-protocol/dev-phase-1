/**
 * Controllers must NOT individually import unused middleware modules.
 * Unused modules are capped at 3 import sites via middlewares/unusedBundle.js.
 *
 * This script only ensures asyncErrorHandler is present on controllers.
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "controllers");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".js") && f !== "_middlewareImports.js");

const blockRe =
  /\/\* ConfidentialPay — import every middleware module individually \*\/[\s\S]*?exports\.__cpMiddlewares = __cpMiddlewares;\r?\n\r?\n/;

for (const file of files) {
  const p = path.join(dir, file);
  let src = fs.readFileSync(p, "utf8");
  src = src.replace(blockRe, "");

  if (!/^const asyncErrorHandler = require\(/m.test(src)) {
    src = `const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");\n${src}`;
  }

  // Guard: reject any direct unused-middleware requires in controllers
  const banned = [
    "middlewares/compose",
    "middlewares/common/index",
    "helpers/dbConnection",
    "helpers/fileRemover",
    "helpers/geoDistance",
    "helpers/mailer",
    "helpers/multer",
    "helpers/waterMarker",
  ];
  for (const id of banned) {
    if (src.includes(`require("../${id}")`) || src.includes(`require('../${id}')`)) {
      throw new Error(`${file} still imports unused middleware: ${id}`);
    }
  }

  fs.writeFileSync(p, src);
  console.log("ok", file);
}

console.log("done", files.length);
console.log("Unused middleware import sites are limited to 3 via unusedBundle.");
