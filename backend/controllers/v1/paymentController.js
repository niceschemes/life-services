const Payment = require('../../models/Payment');
const Subscription = require('../../models/Subscription');
const tenantQuery = require('../../utils/tenantQuery');
const asyncHandler = require('../../utils/asyncHandler');
const paymentService = require('../../services/paymentService');

exports.list = asyncHandler(async (req, res) => {
  const payments = await Payment.find(tenantQuery(req)).sort({ createdAt: -1 }).lean();
  res.json(payments);
});

exports.create = asyncHandler(async (req, res) => {
  const payment = await paymentService.createCharge({
    companyId: req.user.companyId,
    clienteId: req.body.clienteId,
    descricao: req.body.descricao,
    valor: req.body.valor,
    provider: req.body.provider || 'pix',
    origem: req.body.origem || {},
    metadata: req.body.metadata || {}
  });
  res.status(201).json(payment);
});

exports.markPaid = asyncHandler(async (req, res) => {
  const payment = await paymentService.markPaid(req.params.id, req.user.companyId, {
    confirmedBy: req.user.usuario || 'manual'
  });
  res.json(payment);
});

exports.subscriptionMine = asyncHandler(async (req, res) => {
  const subscription = await paymentService.ensureSubscription(req.user.companyId);
  res.json(subscription);
});

exports.updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await paymentService.updateSubscription(req.user.companyId, req.body);
  res.json(subscription);
});

exports.webhookDemo = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ externalId: req.body.externalId });
  if (!payment) {
    return res.status(404).json({ error: 'Pagamento não encontrado pelo externalId' });
  }
  const updated = await paymentService.markPaid(payment._id, payment.companyId, {
    providerWebhook: true,
    payload: req.body
  });
  res.json(updated);
});
