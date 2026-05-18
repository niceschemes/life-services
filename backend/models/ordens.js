const mongoose = require('mongoose');

const OrdemSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },

  codigo: { type: String, default: '' },
  numeroSequencial: { type: Number, default: 0 },

  cliente: { type: String, required: true },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },

  descricao: { type: String, required: true },
  valor: { type: Number, required: true },

  status: {
    type: String,
    default: 'Pendente',
    enum: [
      'Pendente', 'Em andamento', 'Aguardando cliente', 'Aguardando peça',
      'Aguardando pagamento', 'Visita técnica', 'Orçamento enviado',
      'Orçamento aprovado', 'Concluída', 'Concluído', 'Finalizada', 'Cancelada'
    ]
  },

  prioridade: {
    type: String,
    enum: ['Urgente', 'Media', 'Baixa'],
    default: 'Media'
  },

  sla: {
    horas: { type: Number, default: 24 },
    vencimento: { type: Date }
  },

  categoria: { type: String, default: 'geral' },
  subtipo: { type: String, default: '' },

  tecnico: { type: String, default: '' },
  equipe: [{ type: String }],
  telefone: { type: String, default: '' },

  dataAgendada: { type: Date },
  pagamentoStatus: {
    type: String,
    enum: ['Pendente', 'Recebido', 'Parcial'],
    default: 'Pendente'
  },

  tempoGastoMinutos: { type: Number, default: 0 },
  kmRodados: { type: Number, default: 0 },
  custos: { type: Number, default: 0 },
  lucro: { type: Number, default: 0 },
  comissao: { type: Number, default: 0 },
  margem: { type: Number, default: 0 },
  garantiaDias: { type: Number, default: 0 },

  checklist: [{
    texto: String,
    concluido: { type: Boolean, default: false }
  }],

  historico: [{
    data: { type: Date, default: Date.now },
    descricao: String,
    usuario: String,
    tipo: { type: String, default: 'evento' }
  }],

  timeline: [{
    data: { type: Date, default: Date.now },
    acao: String,
    usuario: String,
    detalhes: mongoose.Schema.Types.Mixed
  }],

  materiais: [{
    nome: String,
    quantidade: Number,
    custo: Number
  }],

  fotos: [{
    tipo: { type: String, enum: ['Antes', 'Depois', 'Geral'], default: 'Geral' },
    nome: String,
    url: String,
    data: { type: Date, default: Date.now }
  }],

  anexos: [{
    nome: String,
    url: String,
    tipo: String
  }],

  assinaturas: {
    orcamento: String,
    os: String,
    entrega: String
  },

  observacoes: { type: String, default: '' },
  observacoesInternas: { type: String, default: '' },

  data: { type: Date, default: Date.now }
});

OrdemSchema.index({ companyId: 1, numeroSequencial: -1 });
OrdemSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Ordem', OrdemSchema);
