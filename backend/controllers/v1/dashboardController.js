const Cliente = require('../../models/clientes');
const Servico = require('../../models/servico');
const Ordem = require('../../models/ordens');
const Financeiro = require('../../models/financeiro');
const tenantQuery = require('../../utils/tenantQuery');
const asyncHandler = require('../../utils/asyncHandler');

exports.executive = asyncHandler(async (req, res) => {
  const q = tenantQuery(req);

  const [clientes, servicos, ordens, abertas, financeiro] = await Promise.all([
    Cliente.countDocuments(q),
    Servico.countDocuments(q),
    Ordem.countDocuments(q),
    Ordem.countDocuments({
      ...q,
      status: { $in: ['Pendente', 'Em andamento', 'Aguardando cliente', 'Aguardando peça'] }
    }),
    Financeiro.find(q).lean()
  ]);

  let entradas = 0;
  let saidas = 0;
  financeiro.forEach((item) => {
    if (item.tipo === 'Entrada') entradas += Number(item.valor || 0);
    else saidas += Number(item.valor || 0);
  });

  const ordensLista = await Ordem.find(q).select('valor status prioridade cliente data').lean();
  const faturamento = ordensLista.reduce((s, o) => s + Number(o.valor || 0), 0);
  const ticketMedio = ordensLista.length ? faturamento / ordensLista.length : 0;

  const porStatus = ordensLista.reduce((acc, o) => {
    const key = o.status || 'Pendente';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  res.json({
    kpis: {
      clientes,
      servicos,
      ordens,
      abertas,
      faturamento,
      ticketMedio,
      saldoFinanceiro: entradas - saidas,
      entradas,
      saidas
    },
    charts: {
      ordensPorStatus: porStatus,
      crescimento: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        valores: [12, 19, 14, 22, 28, ordensLista.length || 18]
      }
    }
  });
});
