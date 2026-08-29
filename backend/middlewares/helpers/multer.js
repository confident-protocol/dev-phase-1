const path = require("path");

let multer = null;
try {
  multer = require("multer");
} catch {
  /* optional peer — mock upload middleware passes through */
}

function passthrough() {
  return (req, res, next) => next();
}

if (!multer) {
  exports.uploadAdminDoc = passthrough();
  exports.uploadAdminPhoto = passthrough();
  exports.uploadUserPhoto = passthrough();
  exports.uploadProductImages = passthrough();
  exports.uploadBannerPhoto = passthrough();
  exports._available = false;
  return;
}

const storageByUser = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${req.profile._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const storageBySuperAdmin = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${req.admin.role}${req.admin._id}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const fileFilter = (req, file, callback) => {
  const ext = path.extname(file.originalname);
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".JPG" && ext !== ".jpeg") {
    return callback(new Error("Not Image"));
  }
  callback(null, true);
};

const limits = { fileSize: 2480 * 3230 };

exports.uploadAdminDoc = multer({ storage, fileFilter, limits }).single("doc");
exports.uploadAdminPhoto = multer({ storage, fileFilter, limits }).single("photo");
exports.uploadUserPhoto = multer({ storage: storageByUser, fileFilter, limits }).single("photo");
exports.uploadProductImages = multer({ storage, fileFilter, limits }).array("productImages", 5);
exports.uploadBannerPhoto = multer({
  storage: storageBySuperAdmin,
  fileFilter,
  limits: { fileSize: 8480 * 4230 },
}).single("bannerPhoto");
exports._available = true;
