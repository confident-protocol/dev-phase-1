const crypto = require("crypto");

function hashLeaf(parts) {
  return crypto.createHash("sha256").update(parts.filter(Boolean).join(":")).digest("hex");
}

function buildMerkleLayers(leaves) {
  if (!leaves.length) return [["empty"]];
  let layer = leaves.map((l) => hashLeaf([l]));
  const layers = [layer];
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1] || left;
      next.push(hashLeaf([left, right]));
    }
    layer = next;
    layers.push(layer);
  }
  return layers;
}

function merkleRootFromEmployees(employees = []) {
  const leaves = employees.map((e) => `${e.id}:${e.wallet}:${e.salaryCipher || e.salary}`);
  const layers = buildMerkleLayers(leaves);
  const root = layers[layers.length - 1][0];
  return { root: `0x${root}`, depth: layers.length, leafCount: leaves.length };
}

module.exports = { hashLeaf, buildMerkleLayers, merkleRootFromEmployees };
