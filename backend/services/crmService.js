const Cliente = require('../models/clientes');

const PIPELINE_STAGES = [
  { id: 'lead', label: 'Lead', cor: '#6366f1' },
  { id: 'prospect', label: 'Prospect', cor: '#8b5cf6' },
  { id: 'negociacao', label: 'Negociação', cor: '#f59e0b' },
  { id: 'proposta', label: 'Proposta', cor: '#22d3ee' },
  { id: 'ganho', label: 'Ganho', cor: '#10b981' },
  { id: 'perdido', label: 'Perdido', cor: '#ef4444' }
];

async function getPipeline(companyId) {
  const filter = companyId ? { companyId } : {};
  const clientes = await Cliente.find(filter).sort({ 'crm.scoreComercial': -1 }).lean();

  const board = {};
  PIPELINE_STAGES.forEach((s) => { board[s.id] = []; });

  clientes.forEach((c) => {
    const etapa = c.crm?.pipeline || c.crm?.etapa || 'lead';
    const key = board[etapa] ? etapa : 'lead';
    board[key].push({
      _id: c._id,
      nome: c.nome,
      telefone: c.telefone,
      email: c.email,
      score: c.crm?.scoreComercial || c.score || 0,
      vip: c.vip,
      tags: c.tags || [],
      ultimoFollowUp: c.crm?.ultimoFollowUp
    });
  });

  return { stages: PIPELINE_STAGES, board };
}

async function moverEtapa(clienteId, etapa, usuario, companyId) {
  const filter = { _id: clienteId, ...(companyId ? { companyId } : {}) };
  const cliente = await Cliente.findOne(filter);
  if (!cliente) {
    const err = new Error('Cliente não encontrado');
    err.status = 404;
    throw err;
  }

  if (!cliente.crm) cliente.crm = {};
  const anterior = cliente.crm.pipeline || 'lead';
  cliente.crm.pipeline = etapa;
  cliente.crm.etapa = etapa;
  cliente.crm.ultimoFollowUp = new Date();

  cliente.timeline = cliente.timeline || [];
  cliente.timeline.push({
    tipo: 'crm',
    descricao: `Movido de ${anterior} para ${etapa}`,
    usuario: usuario || 'sistema'
  });

  await cliente.save();
  return cliente;
}

async function registrarFollowUp(clienteId, nota, usuario, companyId) {
  const filter = { _id: clienteId, ...(companyId ? { companyId } : {}) };
  const cliente = await Cliente.findOne(filter);
  if (!cliente) {
    const err = new Error('Cliente não encontrado');
    err.status = 404;
    throw err;
  }

  cliente.crm = cliente.crm || {};
  cliente.crm.ultimoFollowUp = new Date();
  cliente.timeline = cliente.timeline || [];
  cliente.timeline.push({
    tipo: 'followup',
    descricao: nota,
    usuario: usuario || 'sistema'
  });

  await cliente.save();
  return cliente;
}

module.exports = {
  PIPELINE_STAGES,
  getPipeline,
  moverEtapa,
  registrarFollowUp
};
