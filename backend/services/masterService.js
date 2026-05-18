const Company = require('../models/Company');
const User = require('../models/User');
const Cliente = require('../models/clientes');
const Ordem = require('../models/ordens');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

async function overview() {
  const [
    empresas,
    usuarios,
    clientes,
    ordens,
    pagamentos,
    assinaturas
  ] = await Promise.all([
    Company.countDocuments(),
    User.countDocuments(),
    Cliente.countDocuments(),
    Ordem.countDocuments(),
    Payment.find().lean(),
    Subscription.find().lean()
  ]);

  const mrr = assinaturas
    .filter((s) => ['trial', 'ativa'].includes(s.status))
    .reduce((sum, s) => sum + Number(s.valorMensal || 0), 0);

  const receitaConfirmada = pagamentos
    .filter((p) => p.status === 'pago')
    .reduce((sum, p) => sum + Number(p.valor || 0), 0);

  const porPlano = assinaturas.reduce((acc, sub) => {
    acc[sub.plano] = (acc[sub.plano] || 0) + 1;
    return acc;
  }, {});

  return {
    kpis: {
      empresas,
      usuarios,
      clientes,
      ordens,
      mrr,
      receitaConfirmada
    },
    porPlano,
    assinaturasStatus: assinaturas.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {})
  };
}

async function companies() {
  const companiesList = await Company.find().sort({ createdAt: -1 }).lean();
  return Promise.all(companiesList.map(async (company) => {
    const [users, clientes, ordens, subscription] = await Promise.all([
      User.countDocuments({ companyId: company._id }),
      Cliente.countDocuments({ companyId: company._id }),
      Ordem.countDocuments({ companyId: company._id }),
      Subscription.findOne({ companyId: company._id }).lean()
    ]);

    return {
      ...company,
      metrics: { users, clientes, ordens },
      subscription
    };
  }));
}

module.exports = {
  overview,
  companies
};
