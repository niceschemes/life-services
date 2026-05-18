const AutomationRule = require('../models/AutomationRule');
const notificationService = require('./notificationService');

async function list(companyId) {
  return AutomationRule.find(companyId ? { companyId } : {}).sort({ createdAt: -1 }).lean();
}

async function create(companyId, payload) {
  return AutomationRule.create({
    companyId,
    nome: payload.nome,
    descricao: payload.descricao || '',
    trigger: payload.trigger || 'manual',
    conditions: payload.conditions || {},
    actions: payload.actions?.length ? payload.actions : [{
      type: 'notificacao',
      titulo: payload.nome || 'Automação executada',
      mensagem: payload.descricao || 'Workflow acionado'
    }]
  });
}

async function runRule(rule, context = {}) {
  const executions = [];

  for (const action of rule.actions || []) {
    if (action.type === 'notificacao') {
      const notif = await notificationService.criar({
        companyId: rule.companyId,
        tipo: 'info',
        titulo: action.titulo || rule.nome,
        mensagem: action.mensagem || `Automação: ${rule.nome}`,
        link: context.link || '/',
        broadcastCompany: true
      });
      executions.push({ type: action.type, ok: true, notificationId: notif._id });
    } else {
      executions.push({
        type: action.type,
        ok: true,
        demo: true,
        message: `${action.type} preparado para integração real`
      });
    }
  }

  rule.lastRunAt = new Date();
  rule.runCount += 1;
  await rule.save();

  return executions;
}

async function runManual(ruleId, companyId, context = {}) {
  const rule = await AutomationRule.findOne({ _id: ruleId, ...(companyId ? { companyId } : {}) });
  if (!rule) {
    const err = new Error('Automação não encontrada');
    err.status = 404;
    throw err;
  }

  return runRule(rule, context);
}

async function runByTrigger(trigger, companyId, context = {}) {
  const rules = await AutomationRule.find({
    trigger,
    enabled: true,
    ...(companyId ? { companyId } : {})
  });

  const results = [];
  for (const rule of rules) {
    results.push({
      ruleId: rule._id,
      nome: rule.nome,
      executions: await runRule(rule, context)
    });
  }
  return results;
}

module.exports = {
  list,
  create,
  runManual,
  runByTrigger
};
