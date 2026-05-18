const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  descricao: { type: String, required: true },
  quantidade: { type: Number, default: 1 },
  valorUnitario: { type: Number, required: true },
  desconto: { type: Number, default: 0 }
}, { _id: false });

const OrcamentoSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  codigo: { type: String, default: '' },
  numeroSequencial: { type: Number, default: 0 },
  versao: { type: Number, default: 1 },
  versaoPaiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Orcamento' },

  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  clienteNome: { type: String, required: true },
  clienteEmail: { type: String, default: '' },
  clienteTelefone: { type: String, default: '' },

  itens: [ItemSchema],
  subtotal: { type: Number, default: 0 },
  descontoTotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['rascunho', 'enviado', 'aprovado', 'rejeitado', 'convertido', 'expirado'],
    default: 'rascunho'
  },

  validade: { type: Date },
  observacoes: { type: String, default: '' },
  condicoesComerciais: { type: String, default: 'Proposta válida conforme prazo indicado. Valores sujeitos a impostos aplicáveis.' },
  assinaturaCliente: { type: String, default: '' },

  historico: [{
    data: { type: Date, default: Date.now },
    acao: String,
    usuario: String,
    detalhes: mongoose.Schema.Types.Mixed
  }],

  ordemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ordem' },
  criadoPor: { type: String, default: '' }
}, { timestamps: true });

OrcamentoSchema.index({ companyId: 1, numeroSequencial: -1 });
OrcamentoSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Orcamento', OrcamentoSchema);
