const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  plano: {
    type: String,
    enum: ['basico', 'profissional', 'enterprise'],
    default: 'profissional'
  },
  status: {
    type: String,
    enum: ['trial', 'ativa', 'past_due', 'cancelada', 'suspensa'],
    default: 'trial'
  },
  valorMensal: { type: Number, default: 199 },
  trialEndsAt: { type: Date },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { type: Date },
  provider: { type: String, enum: ['manual', 'stripe', 'mercado_pago'], default: 'manual' },
  providerSubscriptionId: { type: String, default: '' },
  limites: {
    usuarios: { type: Number, default: 25 },
    clientes: { type: Number, default: 5000 },
    ordensMes: { type: Number, default: 20000 },
    automacoes: { type: Number, default: 50 }
  }
}, { timestamps: true });

SubscriptionSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
