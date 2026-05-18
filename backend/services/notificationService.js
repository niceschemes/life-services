const Notification = require('../models/Notification');

let ioRef = null;

function setIo(io) {
  ioRef = io;
}

async function criar({
  companyId,
  userId,
  clienteId,
  tipo = 'info',
  titulo,
  mensagem = '',
  link = '',
  critica = false,
  broadcastCompany = true
}) {
  const payload = {
    companyId: companyId || undefined,
    userId: userId || undefined,
    clienteId: clienteId || undefined,
    tipo,
    titulo,
    mensagem,
    link,
    critica
  };

  const notif = await Notification.create(payload);
  const json = notif.toObject();

  if (ioRef) {
    if (userId) {
      ioRef.to(`user:${userId}`).emit('notification', json);
    }
    if (broadcastCompany && companyId) {
      ioRef.to(`company:${companyId}`).emit('notification', json);
    }
    if (clienteId) {
      ioRef.to(`portal:${clienteId}`).emit('notification', json);
    }
  }

  return notif;
}

async function listarUsuario(userId, companyId, limite = 50) {
  const filter = { $or: [] };
  if (userId) filter.$or.push({ userId });
  if (companyId) filter.$or.push({ companyId, userId: { $exists: false } });
  if (!filter.$or.length) return [];

  return Notification.find(filter.$or.length ? filter : {})
    .sort({ createdAt: -1 })
    .limit(limite)
    .lean();
}

async function listarEmpresa(companyId, limite = 50) {
  return Notification.find({ companyId }).sort({ createdAt: -1 }).limit(limite).lean();
}

async function marcarLida(id, userId) {
  return Notification.findOneAndUpdate(
    { _id: id, ...(userId ? { $or: [{ userId }, { userId: { $exists: false } }] } : {}) },
    { lida: true },
    { new: true }
  );
}

async function marcarTodasLidas(userId, companyId) {
  const filter = {};
  if (userId) filter.userId = userId;
  else if (companyId) filter.companyId = companyId;
  await Notification.updateMany({ ...filter, lida: false }, { lida: true });
}

async function contarNaoLidas(userId, companyId) {
  const filter = { lida: false, $or: [] };
  if (userId) filter.$or.push({ userId });
  if (companyId) filter.$or.push({ companyId });
  if (!filter.$or.length) return 0;
  return Notification.countDocuments(filter);
}

module.exports = {
  setIo,
  criar,
  listarUsuario,
  listarEmpresa,
  marcarLida,
  marcarTodasLidas,
  contarNaoLidas
};
