const jwt = require('jsonwebtoken');
const config = require('../config');
const ChatMessage = require('../models/ChatMessage');
const notificationService = require('./notificationService');

function initSocket(httpServer) {
  const { Server } = require('socket.io');
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket.io'
  });

  notificationService.setIo(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Token obrigatório'));

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const u = socket.user;

    if (u.tipo === 'portal') {
      socket.join(`portal:${u.id}`);
      if (u.companyId) socket.join(`company:${u.companyId}`);
    } else {
      socket.join(`user:${u.id}`);
      if (u.companyId) {
        socket.join(`company:${u.companyId}`);
        socket.join(`chat:${u.companyId}`);
      }
    }

    socket.on('chat:join', (room) => {
      if (u.companyId) socket.join(`chat:${u.companyId}:${room || 'geral'}`);
    });

    socket.on('chat:send', async (payload, ack) => {
      try {
        if (!u.companyId && u.tipo !== 'portal') {
          throw new Error('Sem empresa');
        }
        const room = payload.room || 'geral';
        const msg = await ChatMessage.create({
          companyId: u.companyId,
          room,
          remetenteId: String(u.id),
          remetenteNome: u.nome || u.usuario || 'Usuário',
          texto: String(payload.texto || '').slice(0, 4000),
          anexo: payload.anexo || ''
        });

        const data = msg.toObject();
        io.to(`chat:${u.companyId}:${room}`).emit('chat:message', data);
        io.to(`chat:${u.companyId}`).emit('chat:message', data);

        if (typeof ack === 'function') ack({ ok: true, message: data });
      } catch (err) {
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    socket.on('notification:read', async (id) => {
      await notificationService.marcarLida(id, u.tipo === 'portal' ? null : u.id);
    });

    socket.emit('connected', {
      userId: u.id,
      companyId: u.companyId,
      tipo: u.tipo || 'staff'
    });
  });

  return io;
}

module.exports = { initSocket };
