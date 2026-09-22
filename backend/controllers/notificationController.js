const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const { listNotifications, createNotification } = require("../middlewares/helpers/createNotification");

exports.listMine = asyncErrorHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id || "admin";
  res.status(200).json({ success: true, items: listNotifications(userId) });
});

exports.create = asyncErrorHandler(async (req, res) => {
  const ntf = createNotification({
    userId: req.user?.id || "admin",
    title: req.body?.title || "ConfidentialPay notice",
    message: req.body?.message || "Protocol event",
    type: req.body?.type || "info",
    meta: req.body?.meta || {},
  });
  res.status(201).json({ success: true, notification: ntf });
});
