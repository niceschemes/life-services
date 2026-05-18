const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  clienteNome: { type: String, default: '' },
  codigo: { type: String, default: '' },
  titulo: { type: String, required: true },
  descricao: { type: String, default: '' },
  status: {
    type: String,
    enum: ['aberto', 'em_atendimento', 'aguardando_cliente', 'resolvido', 'fechado'],
    default: 'aberto'
  },
  prioridade: {
    type: String,
    enum: ['baixa', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  slaHoras: { type: Number, default: 48 },
  respostas: [{
    data: { type: Date, default: Date.now },
    autor: String,
    texto: String,
    interno: { type: Boolean, default: false }
  }]
}, { timestamps: true });

TicketSchema.index({ companyId: 1, clienteId: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', TicketSchema);
