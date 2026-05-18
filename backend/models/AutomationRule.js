const mongoose = require('mongoose');

const AutomationRuleSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  nome: { type: String, required: true },
  descricao: { type: String, default: '' },
  trigger: {
    type: String,
    enum: [
      'ordem_criada',
      'ordem_status_alterado',
      'orcamento_aprovado',
      'pagamento_atrasado',
      'estoque_baixo',
      'manual'
    ],
    default: 'manual'
  },
  conditions: { type: mongoose.Schema.Types.Mixed, default: {} },
  actions: [{
    type: {
      type: String,
      enum: ['notificacao', 'email_mock', 'whatsapp_mock', 'criar_tarefa', 'webhook_mock'],
      default: 'notificacao'
    },
    titulo: String,
    mensagem: String,
    url: String
  }],
  enabled: { type: Boolean, default: true },
  lastRunAt: { type: Date },
  runCount: { type: Number, default: 0 }
}, { timestamps: true });

AutomationRuleSchema.index({ companyId: 1, trigger: 1, enabled: 1 });

module.exports = mongoose.model('AutomationRule', AutomationRuleSchema);
