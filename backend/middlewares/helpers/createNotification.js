/**
 * In-memory notification bus — no Mongo Notification/SocketMapping.
 */
const notifications = [
  {
    id: "ntf_seed_1",
    userId: "admin",
    title: "Payroll ready",
    message: "March bi-weekly batch is ready for review on BNB Chain.",
    type: "info",
    meta: {},
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "ntf_seed_2",
    userId: "admin",
    title: "Compliance clear",
    message: "AML mesh cleared 12 employee wallets this hour.",
    type: "success",
    meta: {},
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: "ntf_seed_3",
    userId: "admin",
    title: "Treasury deposit",
    message: "USDC deposit of $10,000 confirmed on BNB.",
    type: "info",
    meta: {},
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

function createNotification({ userId, title, message, type = "info", meta = {} }) {
  const row = {
    id: `ntf_${Date.now().toString(36)}`,
    userId: userId || "admin",
    title,
    message,
    type,
    meta,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(row);
  return row;
}

function listNotifications(userId) {
  if (!userId) return notifications.slice(0, 50);
  return notifications.filter((n) => n.userId === userId).slice(0, 50);
}

function notifyMiddleware(factory) {
  return (req, res, next) => {
    const payload = typeof factory === "function" ? factory(req) : factory;
    if (payload) {
      req.notification = createNotification({
        userId: req.user?.id || req.user?._id,
        ...payload,
      });
    }
    next();
  };
}

module.exports = createNotification;
module.exports.createNotification = createNotification;
module.exports.listNotifications = listNotifications;
module.exports.notifyMiddleware = notifyMiddleware;
