const { canAccess, ROLES } = require('../config/permissions');

module.exports = function rbac(moduleName) {
  return function rbacMiddleware(req, res, next) {
    const role = req.user?.role || ROLES.TECNICO;

    if (role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const permissions = req.user?.permissions || [];
    if (permissions.includes(moduleName) || canAccess(role, moduleName)) {
      return next();
    }

    return res.status(403).json({
      error: 'Sem permissão para este módulo',
      module: moduleName
    });
  };
};
