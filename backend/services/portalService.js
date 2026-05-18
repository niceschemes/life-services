const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const Cliente = require('../models/clientes');
const Ordem = require('../models/ordens');
const Orcamento = require('../models/Orcamento');
const Ticket = require('../models/Ticket');

function signPortalToken(cliente) {
  return jwt.sign(
    {
      id: cliente._id,
      role: 'cliente',
      companyId: cliente.companyId ? String(cliente.companyId) : null,
      tipo: 'portal',
      nome: cliente.nome,
      email: cliente.portal?.email || cliente.email
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

async function ativarPortal(clienteId, email, senha, companyId) {
  const filter = { _id: clienteId, ...(companyId ? { companyId } : {}) };
  const cliente = await Cliente.findOne(filter);
  if (!cliente) {
    const err = new Error('Cliente não encontrado');
    err.status = 404;
    throw err;
  }

  const hash = await bcrypt.hash(senha, 10);
  cliente.portal = {
    ativo: true,
    email: (email || cliente.email || '').toLowerCase(),
    senha: hash
  };
  await cliente.save();
  return cliente;
}

async function login(email, senha) {
  const loginEmail = String(email || '').toLowerCase().trim();
  const cliente = await Cliente.findOne({
    'portal.ativo': true,
    'portal.email': loginEmail
  });

  if (!cliente) {
    const err = new Error('Acesso ao portal não encontrado');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(senha, cliente.portal.senha);
  if (!ok) {
    const err = new Error('Senha inválida');
    err.status = 401;
    throw err;
  }

  return {
    token: signPortalToken(cliente),
    cliente: {
      id: cliente._id,
      nome: cliente.nome,
      email: cliente.portal.email
    }
  };
}

async function getOrdens(clienteId, companyId) {
  const filter = {
    $or: [
      { clienteId },
      { cliente: await getClienteNome(clienteId) }
    ]
  };
  if (companyId) filter.companyId = companyId;
  return Ordem.find(filter).sort({ data: -1 }).lean();
}

async function getOrcamentos(clienteId, companyId) {
  const filter = { clienteId };
  if (companyId) filter.companyId = companyId;
  return Orcamento.find(filter).sort({ createdAt: -1 }).lean();
}

async function getTickets(clienteId, companyId) {
  const filter = { clienteId };
  if (companyId) filter.companyId = companyId;
  return Ticket.find(filter).sort({ createdAt: -1 }).lean();
}

async function criarTicket(clienteId, companyId, payload) {
  const cliente = await Cliente.findById(clienteId);
  if (!cliente) {
    const err = new Error('Cliente não encontrado');
    err.status = 404;
    throw err;
  }

  const count = await Ticket.countDocuments({ companyId: companyId || cliente.companyId }) + 1;
  const ticket = await Ticket.create({
    companyId: companyId || cliente.companyId,
    clienteId,
    clienteNome: cliente.nome,
    codigo: `TK-${String(count).padStart(5, '0')}`,
    titulo: payload.titulo,
    descricao: payload.descricao || '',
    prioridade: payload.prioridade || 'media',
    respostas: [{
      autor: cliente.nome,
      texto: payload.descricao || 'Chamado aberto pelo portal',
      interno: false
    }]
  });

  return ticket;
}

async function aprovarOrcamento(orcamentoId, clienteId) {
  const orc = await Orcamento.findOne({ _id: orcamentoId, clienteId });
  if (!orc) {
    const err = new Error('Orçamento não encontrado');
    err.status = 404;
    throw err;
  }
  orc.status = 'aprovado';
  orc.historico.push({ acao: 'approved_portal', usuario: 'portal-cliente' });
  await orc.save();
  return orc;
}

async function getClienteNome(id) {
  const c = await Cliente.findById(id).select('nome');
  return c?.nome || '';
}

module.exports = {
  signPortalToken,
  ativarPortal,
  login,
  getOrdens,
  getOrcamentos,
  getTickets,
  criarTicket,
  aprovarOrcamento
};
