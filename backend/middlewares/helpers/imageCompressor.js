const path = require("path");

let Jimp = null;
try {
  Jimp = require("jimp");
} catch {
  /* optional peer — mock mode skips image compression */
}

module.exports = async (filename, width, inputPath, outputDir, folder) => {
  if (!Jimp) return `${folder}/${filename}`;
  try {
    const image = await Jimp.read(inputPath);
    image.resize(width, Jimp.AUTO).write(path.resolve(outputDir, `${folder}`, filename));
  } catch (err) {
    console.log("Error at reducing size / converting picture : ");
    console.log(err);
  }
  return `${folder}/${filename}`;
};
