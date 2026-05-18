const mongoose = require('mongoose');

const FinanceiroSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  tipo: { type: String, required: true },
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  categoria: { type: String, default: 'geral' },
  centroCusto: { type: String, default: '' },
  recorrente: { type: Boolean, default: false },
  data: { type: Date, default: Date.now }
});

FinanceiroSchema.index({ companyId: 1, data: -1 });

module.exports = mongoose.model('Financeiro', FinanceiroSchema);
