const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function portalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Sem token' });

  try {
    const decoded = jwt.verify(header.split(' ')[1], config.jwtSecret);
    if (decoded.tipo !== 'portal') {
      return res.status(403).json({ error: 'Acesso exclusivo do portal do cliente' });
    }
    req.user = decoded;
    req.portalClienteId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
