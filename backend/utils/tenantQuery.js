module.exports = function tenantQuery(req, base = {}) {
  if (req.user && req.user.companyId) {
    return { ...base, companyId: req.user.companyId };
  }
  return base;
};
