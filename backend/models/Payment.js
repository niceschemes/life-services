const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  origem: {
    tipo: { type: String, enum: ['orcamento', 'ordem', 'assinatura', 'avulso'], default: 'avulso' },
    id: { type: String, default: '' }
  },
  provider: {
    type: String,
    enum: ['pix', 'mercado_pago', 'stripe', 'manual'],
    default: 'pix'
  },
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  moeda: { type: String, default: 'BRL' },
  status: {
    type: String,
    enum: ['pendente', 'processando', 'pago', 'falhou', 'cancelado', 'estornado'],
    default: 'pendente'
  },
  externalId: { type: String, default: '' },
  checkoutUrl: { type: String, default: '' },
  pix: {
    copiaCola: { type: String, default: '' },
    qrCode: { type: String, default: '' },
    expiresAt: { type: Date }
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  paidAt: { type: Date }
}, { timestamps: true });

PaymentSchema.index({ companyId: 1, status: 1, createdAt: -1 });
PaymentSchema.index({ externalId: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
