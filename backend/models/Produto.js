const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  nome: { type: String, required: true, trim: true },
  sku: { type: String, default: '' },
  codigoBarras: { type: String, default: '' },
  categoria: { type: String, default: 'geral' },
  unidade: { type: String, default: 'UN' },
  fornecedor: { type: String, default: '' },
  estoqueAtual: { type: Number, default: 0 },
  estoqueMinimo: { type: Number, default: 0 },
  custoMedio: { type: Number, default: 0 },
  precoVenda: { type: Number, default: 0 },
  margem: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

ProdutoSchema.index({ companyId: 1, sku: 1 });
ProdutoSchema.index({ companyId: 1, nome: 1 });

module.exports = mongoose.model('Produto', ProdutoSchema);
