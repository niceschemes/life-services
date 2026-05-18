const mongoose = require('mongoose');

const ContatoSchema = new mongoose.Schema({
  nome: String,
  cargo: String,
  telefone: String,
  email: String
}, { _id: false });

const ClienteSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },

  nome: { type: String, required: true, trim: true },
  documento: { type: String, default: '' },
  email: { type: String, default: '' },
  telefone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  endereco: { type: String, default: '' },
  cidade: { type: String, default: '' },
  estado: { type: String, default: '' },
  cep: { type: String, default: '' },
  geolocalizacao: {
    lat: Number,
    lng: Number
  },

  avatar: { type: String, default: '' },
  observacoes: { type: String, default: '' },
  status: { type: String, default: 'ativo' },
  tags: [{ type: String }],
  categoria: { type: String, default: 'padrao' },
  score: { type: Number, default: 0 },
  vip: { type: Boolean, default: false },
  inadimplente: { type: Boolean, default: false },
  recorrente: { type: Boolean, default: false },
  potencialFinanceiro: { type: Number, default: 0 },
  aniversario: { type: Date },

  empresaVinculada: { type: String, default: '' },
  responsavel: { type: String, default: '' },
  setor: { type: String, default: '' },
  inscricaoEstadual: { type: String, default: '' },
  contatos: [ContatoSchema],

  crm: {
    pipeline: { type: String, default: 'lead' },
    etapa: { type: String, default: 'novo' },
    scoreComercial: { type: Number, default: 0 },
    ultimoFollowUp: { type: Date }
  },

  timeline: [{
    data: { type: Date, default: Date.now },
    tipo: String,
    descricao: String,
    usuario: String
  }],

  portal: {
    ativo: { type: Boolean, default: false },
    email: { type: String, lowercase: true, trim: true },
    senha: { type: String, default: '' }
  },

  createdAt: { type: Date, default: Date.now }
});

ClienteSchema.index({ 'portal.email': 1 }, { sparse: true });

ClienteSchema.index({ companyId: 1, nome: 1 });
ClienteSchema.index({ companyId: 1, documento: 1 });

module.exports = mongoose.model('Cliente', ClienteSchema);
