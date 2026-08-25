const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");
const { transactions } = require("../data/businessData");

const runtimePayrollOrders = [];

function normalizePayrollOrder(payload = {}, id) {
  return {
    id,
    type: payload.type || "payroll",
    amount: Number(payload.amount) || 0,
    status: payload.status || "queued",
    chain: payload.chain || "BNB",
    destChain: payload.destChain || "ETH",
    employees: payload.employees || payload.employeeCount || 0,
    employeeIds: payload.employeeIds || [],
    fee: payload.fee || 0,
    note: payload.note || "",
    pipelineId: payload.pipelineId || null,
    createdAt: new Date().toISOString(),
  };
}

// Create confidential payroll settlement order (legacy /orders path)
exports.newOrder = asyncErrorHandler(async (req, res, next) => {
  const order = normalizePayrollOrder(req.body, `pay-${Date.now()}`);
  runtimePayrollOrders.push(order);

  res.status(201).json({ success: true, order });
});

exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {
  const order = [...runtimePayrollOrders, ...transactions].find((item) => item.id === req.params.id);

  if (!order) {
    return next(new ErrorHandler("Payroll settlement not found", 404));
  }

  res.status(200).json({ success: true, order });
});

exports.myOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = [...runtimePayrollOrders, ...transactions.filter((item) => item.type === "payroll")];
  res.status(200).json({ success: true, orders });
});

exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
  const orders = [...runtimePayrollOrders, ...transactions.filter((item) => item.type === "payroll")];
  const totalAmount = orders.reduce((sum, item) => sum + (item.amount || 0), 0);

  res.status(200).json({ success: true, orders, totalAmount });
});

exports.updateOrder = asyncErrorHandler(async (req, res, next) => {
  const order = [...runtimePayrollOrders, ...transactions].find((item) => item.id === req.params.id);
  if (!order) {
    return next(new ErrorHandler("Payroll settlement not found", 404));
  }

  order.status = req.body?.status || order.status;
  order.note = req.body?.note || order.note;

  res.status(200).json({ success: true, order });
});

exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
  const index = runtimePayrollOrders.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return next(new ErrorHandler("Payroll settlement not found", 404));
  }

  runtimePayrollOrders.splice(index, 1);
  res.status(200).json({ success: true, message: "Payroll settlement removed" });
});
