/**
 * RBAC Middleware
 * requireRole(...roles) — ensures req.user has one of the allowed roles.
 * Must be used AFTER authMiddleware (so req.user is already set).
 *
 * Role hierarchy: admin inherits all user permissions.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Not authenticated',
      });
    }

    // Admin inherits all roles
    const effectiveRoles = req.user.role === 'admin'
      ? [...roles, 'admin']
      : [req.user.role];

    const hasPermission = roles.some((role) => effectiveRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        type: 'ForbiddenError',
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

module.exports = { requireRole };
