const notificationService = require('../../services/notificationService');
const asyncHandler = require('../../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const lista = req.user.companyId
    ? await notificationService.listarEmpresa(req.user.companyId)
  : await notificationService.listarUsuario(req.user.id, req.user.companyId);
  res.json(lista);
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.contarNaoLidas(req.user.id, req.user.companyId);
  res.json({ count });
});

exports.markRead = asyncHandler(async (req, res) => {
  const doc = await notificationService.marcarLida(req.params.id, req.user.id);
  res.json(doc || { ok: true });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await notificationService.marcarTodasLidas(req.user.id, req.user.companyId);
  res.json({ ok: true });
});
