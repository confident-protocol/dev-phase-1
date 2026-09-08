const express = require("express");
const ctrl = require("../controllers/templateController");
const { optionalAuth, authorizeRoles } = require("../middlewares/user_actions/auth");
const { attachWorkspace } = require("../middlewares/protocol/workspaceContext");
const { attachPrivacyContext } = require("../middlewares/protocol/privacyContext");
const { idempotencyGuard } = require("../middlewares/common/idempotency");
const { auditMutation } = require("../middlewares/protocol/auditMiddleware");
const { validatePagination } = require("../middlewares/validator");

const router = express.Router();
const base = [optionalAuth, attachWorkspace, attachPrivacyContext];
const write = [...base, authorizeRoles("admin", "Owner", "operator"), idempotencyGuard];

router.get("/payroll/templates", ...base, validatePagination, ctrl.list);
router.get("/payroll/templates/:id", ...base, ctrl.getOne);
router.post("/payroll/templates", ...write, auditMutation("template_create"), ctrl.create);
router.put("/payroll/templates/:id", ...write, auditMutation("template_update"), ctrl.update);
router.delete("/payroll/templates/:id", ...write, auditMutation("template_delete"), ctrl.remove);

module.exports = router;
