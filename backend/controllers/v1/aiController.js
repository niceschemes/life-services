const Ordem = require('../../models/ordens');
const Cliente = require('../../models/clientes');
const tenantQuery = require('../../utils/tenantQuery');
const asyncHandler = require('../../utils/asyncHandler');

exports.assistant = asyncHandler(async (req, res) => {
  const { prompt, context } = req.body;
  const q = tenantQuery(req);

  const [ordens, clientes] = await Promise.all([
    Ordem.find(q).sort({ data: -1 }).limit(20).lean(),
    Cliente.find(q).sort({ createdAt: -1 }).limit(20).lean()
  ]);

  const abertas = ordens.filter((o) => !String(o.status).toLowerCase().includes('conclu'));
  const inadimplentes = clientes.filter((c) => c.inadimplente).length;

  const resumo = [
    `Contexto Life Services Enterprise.`,
    `Ordens recentes: ${ordens.length}. Abertas: ${abertas.length}.`,
    `Clientes: ${clientes.length}. Inadimplentes: ${inadimplentes}.`,
    prompt ? `Pergunta: ${prompt}` : 'Análise operacional geral.'
  ].join(' ');

  const sugestoes = [];
  if (abertas.length > 5) {
    sugestoes.push('Priorize ordens urgentes e redistribua técnicos no Kanban.');
  }
  if (inadimplentes > 0) {
    sugestoes.push('Acione follow-up financeiro para clientes inadimplentes.');
  }
  sugestoes.push('Revise SLA das ordens com prioridade Urgente nas próximas 24h.');

  res.json({
    resumo,
    sugestoes,
    previsoes: {
      atrasoProbabilidade: Math.min(95, 20 + abertas.length * 3),
      lucroEstimadoMes: ordens.reduce((s, o) => s + Number(o.lucro || o.valor || 0) * 0.2, 0)
    },
    contextoRecebido: context || null,
    nota: 'Módulo IA preparado para integração com LLM externo (OpenAI, Azure, etc.).'
  });
});

exports.generateDescription = asyncHandler(async (req, res) => {
  const { cliente, categoria, problema } = req.body;
  const texto = [
    `Ordem de serviço — ${categoria || 'Geral'}`,
    `Cliente: ${cliente || 'Não informado'}.`,
    `Problema relatado: ${problema || 'Atendimento técnico padrão'}.`,
    'Checklist sugerido: diagnóstico, execução, testes, entrega e assinatura digital.'
  ].join('\n');

  res.json({ descricao: texto });
});
