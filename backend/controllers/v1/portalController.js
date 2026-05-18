const portalService = require('../../services/portalService');
const notificationService = require('../../services/notificationService');
const asyncHandler = require('../../utils/asyncHandler');
const { authLimiter } = require('../../middleware/security');

exports.login = asyncHandler(async (req, res) => {
  const result = await portalService.login(req.body.email, req.body.senha);
  res.json(result);
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ cliente: { id: req.user.id, nome: req.user.nome, email: req.user.email } });
});

exports.ordens = asyncHandler(async (req, res) => {
  const ordens = await portalService.getOrdens(req.user.id, req.user.companyId);
  res.json(ordens);
});

exports.orcamentos = asyncHandler(async (req, res) => {
  const lista = await portalService.getOrcamentos(req.user.id, req.user.companyId);
  res.json(lista);
});

exports.aprovarOrcamento = asyncHandler(async (req, res) => {
  const orc = await portalService.aprovarOrcamento(req.params.id, req.user.id);
  await notificationService.criar({
    companyId: req.user.companyId,
    tipo: 'success',
    titulo: 'Orçamento aprovado pelo cliente',
    mensagem: `${orc.codigo} aprovado via portal`,
    link: '/orcamentos',
    broadcastCompany: true
  });
  res.json(orc);
});

exports.tickets = asyncHandler(async (req, res) => {
  const tickets = await portalService.getTickets(req.user.id, req.user.companyId);
  res.json(tickets);
});

exports.criarTicket = asyncHandler(async (req, res) => {
  const ticket = await portalService.criarTicket(req.user.id, req.user.companyId, req.body);
  await notificationService.criar({
    companyId: req.user.companyId,
    tipo: 'warning',
    titulo: 'Novo chamado no portal',
    mensagem: ticket.titulo,
    link: '/',
    broadcastCompany: true
  });
  res.status(201).json(ticket);
});

exports.ativarPortal = asyncHandler(async (req, res) => {
  const { clienteId, email, senha } = req.body;
  const cliente = await portalService.ativarPortal(
    clienteId,
    email,
    senha,
    req.user.companyId
  );
  res.json({
    ok: true,
    portalEmail: cliente.portal.email,
    mensagem: 'Portal ativado para o cliente'
  });
});
