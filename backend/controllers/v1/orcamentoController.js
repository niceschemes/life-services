const Orcamento = require('../../models/Orcamento');
const Company = require('../../models/Company');
const tenantQuery = require('../../utils/tenantQuery');
const asyncHandler = require('../../utils/asyncHandler');
const { logAction } = require('../../services/auditService');
const orcamentoService = require('../../services/orcamentoService');
const pdfService = require('../../services/pdfService');

exports.list = asyncHandler(async (req, res) => {
  const lista = await Orcamento.find(tenantQuery(req)).sort({ createdAt: -1 }).lean();
  res.json(lista);
});

exports.getById = asyncHandler(async (req, res) => {
  const doc = await Orcamento.findOne({ _id: req.params.id, ...tenantQuery(req) });
  if (!doc) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json(doc);
});

exports.create = asyncHandler(async (req, res) => {
  const { codigo, numeroSequencial } = await orcamentoService.nextCodigo(req.user.companyId);
  const { subtotal, total } = orcamentoService.calcularTotais(req.body.itens, req.body.descontoTotal);

  const doc = await Orcamento.create({
    ...req.body,
    companyId: req.user.companyId || undefined,
    codigo,
    numeroSequencial,
    subtotal,
    total,
    criadoPor: req.user.usuario,
    historico: [{ acao: 'created', usuario: req.user.usuario }]
  });

  await logAction({
    companyId: req.user.companyId,
    userId: req.user.id,
    action: 'orcamento.created',
    module: 'orcamentos',
    entity: 'Orcamento',
    entityId: doc._id,
    req
  });

  res.status(201).json(doc);
});

exports.update = asyncHandler(async (req, res) => {
  const atual = await Orcamento.findOne({ _id: req.params.id, ...tenantQuery(req) });
  if (!atual) return res.status(404).json({ error: 'Orçamento não encontrado' });

  const itens = req.body.itens || atual.itens;
  const { subtotal, total } = orcamentoService.calcularTotais(itens, req.body.descontoTotal ?? atual.descontoTotal);

  const doc = await Orcamento.findByIdAndUpdate(
    req.params.id,
    { ...req.body, itens, subtotal, total },
    { new: true, runValidators: true }
  );

  res.json(doc);
});

exports.duplicate = asyncHandler(async (req, res) => {
  const original = await Orcamento.findOne({ _id: req.params.id, ...tenantQuery(req) });
  if (!original) return res.status(404).json({ error: 'Orçamento não encontrado' });
  const copia = await orcamentoService.duplicar(original, req.user.usuario);
  res.status(201).json(copia);
});

exports.approve = asyncHandler(async (req, res) => {
  const doc = await Orcamento.findOneAndUpdate(
    { _id: req.params.id, ...tenantQuery(req) },
    {
      status: 'aprovado',
      assinaturaCliente: req.body.assinatura || '',
      $push: { historico: { acao: 'approved', usuario: req.user.usuario } }
    },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json(doc);
});

exports.reject = asyncHandler(async (req, res) => {
  const doc = await Orcamento.findOneAndUpdate(
    { _id: req.params.id, ...tenantQuery(req) },
    {
      status: 'rejeitado',
      $push: { historico: { acao: 'rejected', usuario: req.user.usuario, detalhes: { motivo: req.body.motivo } } }
    },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json(doc);
});

exports.send = asyncHandler(async (req, res) => {
  const doc = await Orcamento.findOneAndUpdate(
    { _id: req.params.id, ...tenantQuery(req) },
    {
      status: 'enviado',
      $push: { historico: { acao: 'sent', usuario: req.user.usuario } }
    },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json(doc);
});

exports.convertToOS = asyncHandler(async (req, res) => {
  const orc = await Orcamento.findOne({ _id: req.params.id, ...tenantQuery(req) });
  if (!orc) return res.status(404).json({ error: 'Orçamento não encontrado' });
  const result = await orcamentoService.converterParaOS(orc, req.user.usuario);
  res.json(result);
});

exports.pdf = asyncHandler(async (req, res) => {
  const orc = await Orcamento.findOne({ _id: req.params.id, ...tenantQuery(req) }).lean();
  if (!orc) return res.status(404).json({ error: 'Orçamento não encontrado' });

  let company = null;
  if (req.user.companyId) {
    company = await Company.findById(req.user.companyId).lean();
  }

  const buffer = await pdfService.generateOrcamentoPdf(orc, company);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${orc.codigo}.pdf"`);
  res.send(buffer);
});

exports.remove = asyncHandler(async (req, res) => {
  const doc = await Orcamento.findOneAndDelete({ _id: req.params.id, ...tenantQuery(req) });
  if (!doc) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json({ ok: true });
});
