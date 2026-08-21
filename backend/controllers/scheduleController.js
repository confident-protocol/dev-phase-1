const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const {
  listSchedules,
  createSchedule,
  cancelSchedule,
  deleteSchedule,
} = require("../services/payroll/scheduleService");

exports.list = asyncErrorHandler(async (req, res) => {
  res.status(200).json({ success: true, items: listSchedules() });
});

exports.create = asyncErrorHandler(async (req, res) => {
  res.status(201).json({ success: true, schedule: createSchedule(req.body || {}) });
});

exports.cancel = asyncErrorHandler(async (req, res) => {
  const schedule = cancelSchedule(req.params.id);
  if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });
  res.status(200).json({ success: true, schedule });
});

exports.remove = asyncErrorHandler(async (req, res) => {
  const ok = deleteSchedule(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: "Schedule not found" });
  res.status(200).json({ success: true, message: "Schedule removed" });
});
