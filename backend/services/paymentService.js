const crypto = require('crypto');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const notificationService = require('./notificationService');

function providerId(provider) {
  return `${provider}_${crypto.randomBytes(8).toString('hex')}`;
}

function pixPayload(payment) {
  const txid = String(payment._id).slice(-12).toUpperCase();
  return [
    '000201',
    '26PIX.LIFE.SERVICES',
    `52040000`,
    `5303986`,
    `54${Number(payment.valor || 0).toFixed(2)}`,
    `58BR`,
    `59LIFE SERVICES`,
    `62${txid}`,
    '6304DEMO'
  ].join('');
}

async function createCharge({ companyId, clienteId, descricao, valor, provider = 'pix', origem = {}, metadata = {} }) {
  const payment = await Payment.create({
    companyId,
    clienteId,
    descricao,
    valor,
    provider,
    origem,
    metadata,
    externalId: providerId(provider),
    status: provider === 'manual' ? 'processando' : 'pendente'
  });

  if (provider === 'pix') {
    payment.pix = {
      copiaCola: pixPayload(payment),
      qrCode: `PIX-DEMO-${payment._id}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    };
  }

  if (provider === 'stripe' || provider === 'mercado_pago') {
    payment.checkoutUrl = `/checkout/demo/${payment._id}?provider=${provider}`;
  }

  await payment.save();

  await notificationService.criar({
    companyId,
    tipo: 'info',
    titulo: 'Cobrança criada',
    mensagem: `${descricao} — R$ ${Number(valor).toFixed(2)}`,
    link: '/pagamentos',
    broadcastCompany: true
  });

  return payment;
}

async function markPaid(paymentId, companyId, metadata = {}) {
  const filter = { _id: paymentId };
  if (companyId) filter.companyId = companyId;

  const payment = await Payment.findOneAndUpdate(
    filter,
    {
      status: 'pago',
      paidAt: new Date(),
      $set: { metadata: { ...metadata, confirmedBy: metadata.confirmedBy || 'manual_demo' } }
    },
    { new: true }
  );

  if (!payment) {
    const err = new Error('Pagamento não encontrado');
    err.status = 404;
    throw err;
  }

  await notificationService.criar({
    companyId: payment.companyId,
    tipo: 'success',
    titulo: 'Pagamento confirmado',
    mensagem: `${payment.descricao} — R$ ${Number(payment.valor).toFixed(2)}`,
    link: '/pagamentos',
    broadcastCompany: true
  });

  return payment;
}

async function ensureSubscription(companyId) {
  let sub = await Subscription.findOne({ companyId });
  if (sub) return sub;

  const company = await Company.findById(companyId);
  sub = await Subscription.create({
    companyId,
    plano: company?.plan || 'profissional',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  return sub;
}

async function updateSubscription(companyId, payload) {
  const sub = await ensureSubscription(companyId);
  Object.assign(sub, payload);
  await sub.save();
  await Company.findByIdAndUpdate(companyId, { plan: sub.plano });
  return sub;
}

module.exports = {
  createCharge,
  markPaid,
  ensureSubscription,
  updateSubscription
};
