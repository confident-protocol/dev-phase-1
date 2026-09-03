/**
 * Compose middleware stacks for ConfidentialPay controllers.
 * Usage: router.get('/x', ...stack(mw1, mw2), handler)
 */
function stack(...middlewares) {
  return middlewares.filter(Boolean);
}

/** Common read stack: identity + workspace + privacy */
function readStack(...extra) {
  const {
    optionalAuth,
  } = require("./user_actions/auth");
  const { attachWorkspace, requireWorkspace } = require("./protocol/workspaceContext");
  const { attachPrivacyContext } = require("./protocol/privacyContext");
  return stack(optionalAuth, attachWorkspace, requireWorkspace, attachPrivacyContext, ...extra);
}

/** Common write stack: auth + validation/audit helpers */
function writeStack(...extra) {
  const { optionalAuth, authorizeRoles } = require("./user_actions/auth");
  const { attachWorkspace } = require("./protocol/workspaceContext");
  const { idempotencyGuard } = require("./common/idempotency");
  const { auditMutation } = require("./protocol/auditMiddleware");
  return stack(
    optionalAuth,
    authorizeRoles("admin", "Owner", "operator", "Compliance"),
    attachWorkspace,
    idempotencyGuard,
    auditMutation("mutation"),
    ...extra
  );
}

module.exports = { stack, readStack, writeStack };
