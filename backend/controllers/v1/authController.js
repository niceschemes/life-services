const authService = require('../../services/authService');
const asyncHandler = require('../../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  if (req.body.empresaNome) {
    const result = await authService.registerEnterprise(req.body, req);
    return res.status(201).json(result);
  }
  const result = await authService.registerLegacy(req.body);
  res.status(201).json(result);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req);
  res.json(result);
});

exports.me = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      usuario: req.user.usuario,
      nome: req.user.nome,
      role: req.user.role,
      companyId: req.user.companyId
    },
    permissions: req.user.permissions || []
  });
});
