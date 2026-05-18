const mongoose = require('mongoose');

const MovimentacaoSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
  produtoNome: { type: String, default: '' },
  tipo: { type: String, enum: ['entrada', 'saida', 'ajuste'], required: true },
  quantidade: { type: Number, required: true },
  custoUnitario: { type: Number, default: 0 },
  motivo: { type: String, default: '' },
  ordemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ordem' },
  usuario: { type: String, default: '' }
}, { timestamps: true });

MovimentacaoSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('MovimentacaoEstoque', MovimentacaoSchema);
