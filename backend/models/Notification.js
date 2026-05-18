const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  tipo: { type: String, default: 'info' },
  titulo: { type: String, required: true },
  mensagem: { type: String, default: '' },
  link: { type: String, default: '' },
  lida: { type: Boolean, default: false },
  critica: { type: Boolean, default: false }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, lida: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
