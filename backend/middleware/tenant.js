module.exports = function requireTenant(req, res, next) {
  if (!req.user?.companyId && req.user?.role !== 'super_admin') {
    return res.status(403).json({
      error: 'Empresa não vinculada. Use registro enterprise ou vincule um companyId.'
    });
  }
  next();
};
