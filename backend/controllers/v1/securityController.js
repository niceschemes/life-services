const asyncHandler = require('../../utils/asyncHandler');
const securityService = require('../../services/securityService');

exports.setupTwoFactor = asyncHandler(async (req, res) => {
  const result = await securityService.setupTwoFactor(req.user.id, req);
  res.json(result);
});

exports.verifyTwoFactor = asyncHandler(async (req, res) => {
  const result = await securityService.verifyTwoFactor(req.user.id, req.body.code, req);
  res.json(result);
});

exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const result = await securityService.requestPasswordReset(req.body.usuarioOuEmail);
  res.json(result);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await securityService.resetPassword(req.body.token, req.body.novaSenha);
  res.json(result);
});
