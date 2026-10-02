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
  const hadBlock = blockRe.test(src);
  src = src.replace(blockRe, "");

  if (!/^const asyncErrorHandler = require\(/m.test(src)) {
    src = `const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");\n${src}`;
  }

  fs.writeFileSync(p, src);
  console.log(hadBlock ? "stripped" : "checked", file);
}

console.log("done", files.length);
