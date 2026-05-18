const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { permissionsForRole } = require('../config/permissions');

module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: 'Sem token' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;

    if (decoded.tipo === 'portal') {
      req.user.permissions = ['portal'];
      req.user.nome = decoded.nome;
    } else if (decoded.id) {
      const user = await User.findById(decoded.id).select('role companyId permissions isActive nome usuario');
      if (user && user.isActive) {
        req.user.role = user.role;
        req.user.companyId = user.companyId ? String(user.companyId) : null;
        req.user.nome = user.nome;
        req.user.usuario = user.usuario;
        req.user.permissions = user.permissions?.length
          ? user.permissions
          : permissionsForRole(user.role);
      }
    }

    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
