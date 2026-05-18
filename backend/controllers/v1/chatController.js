const ChatMessage = require('../../models/ChatMessage');
const tenantQuery = require('../../utils/tenantQuery');
const asyncHandler = require('../../utils/asyncHandler');

exports.history = asyncHandler(async (req, res) => {
  const room = req.query.room || 'geral';
  const filter = {
    ...tenantQuery(req),
    room
  };
  const msgs = await ChatMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json(msgs.reverse());
});

exports.send = asyncHandler(async (req, res) => {
  const room = req.body.room || 'geral';
  const msg = await ChatMessage.create({
    companyId: req.user.companyId || undefined,
    room,
    remetenteId: String(req.user.id),
    remetenteNome: req.user.nome || req.user.usuario || 'Usuário',
    texto: String(req.body.texto || '').slice(0, 4000),
    anexo: req.body.anexo || ''
  });
  res.status(201).json(msg);
});
