const express = require("express");
const ctrl = require("../controllers/employeeController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { hasEmployeeRoster } = require("../middlewares/user_actions/userHas");
const { validatePagination } = require("../middlewares/validator");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { parseBatchRecipients } = require("../middlewares/protocol/csvBatchGuard");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext];
const write = [...base, authorizeRoles("admin", "Owner", "operator", "Admin"), idempotencyGuard];

router.get("/employees", ...base, hasEmployeeRoster, validatePagination, ctrl.list);
router.get("/payroll/employees", ...base, hasEmployeeRoster, validatePagination, ctrl.list);
router.get("/employees/:id", ...base, ctrl.getOne);
router.post("/employees", ...write, auditMutation("employee_create"), ctrl.create);
router.put("/employees/:id", ...write, auditMutation("employee_update"), ctrl.update);
router.delete("/employees/:id", ...write, auditMutation("employee_delete"), ctrl.remove);
router.post("/employees/:id/approve", ...write, auditMutation("employee_approve"), ctrl.approve);
router.post(
  "/employees/import",
  ...write,
  parseBatchRecipients,
  auditMutation("employee_bulk_import"),
  ctrl.bulkImport
);

module.exports = router;
