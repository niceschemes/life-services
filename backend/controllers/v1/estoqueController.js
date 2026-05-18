const Produto = require('../../models/Produto');
const MovimentacaoEstoque = require('../../models/MovimentacaoEstoque');
const tenantQuery = require('../../utils/tenantQuery');
const asyncHandler = require('../../utils/asyncHandler');
const estoqueService = require('../../services/estoqueService');

exports.listProdutos = asyncHandler(async (req, res) => {
  const produtos = await Produto.find(tenantQuery(req)).sort({ nome: 1 }).lean();
  res.json(produtos);
});

exports.createProduto = asyncHandler(async (req, res) => {
  const produto = await Produto.create({
    ...req.body,
    companyId: req.user.companyId || undefined
  });
  res.status(201).json(produto);
});

exports.updateProduto = asyncHandler(async (req, res) => {
  const produto = await Produto.findOneAndUpdate(
    { _id: req.params.id, ...tenantQuery(req) },
    req.body,
    { new: true }
  );
  if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(produto);
});

exports.deleteProduto = asyncHandler(async (req, res) => {
  const produto = await Produto.findOneAndDelete({ _id: req.params.id, ...tenantQuery(req) });
  if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json({ ok: true });
});

exports.movimentar = asyncHandler(async (req, res) => {
  const result = await estoqueService.registrarMovimentacao({
    companyId: req.user.companyId,
    produtoId: req.params.id,
    tipo: req.body.tipo,
    quantidade: req.body.quantidade,
    custoUnitario: req.body.custoUnitario,
    motivo: req.body.motivo,
    ordemId: req.body.ordemId,
    usuario: req.user.usuario
  });
  res.json(result);
});

exports.historico = asyncHandler(async (req, res) => {
  const movs = await MovimentacaoEstoque.find(tenantQuery(req))
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json(movs);
});

exports.alertas = asyncHandler(async (req, res) => {
  const alertas = await estoqueService.alertasEstoqueBaixo(req.user.companyId);
  res.json(alertas);
});
