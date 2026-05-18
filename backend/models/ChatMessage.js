const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  room: { type: String, default: 'geral', index: true },
  remetenteId: { type: String, required: true },
  remetenteNome: { type: String, required: true },
  texto: { type: String, required: true },
  anexo: { type: String, default: '' }
}, { timestamps: true });

ChatMessageSchema.index({ companyId: 1, room: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
