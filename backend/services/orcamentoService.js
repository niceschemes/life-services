const Orcamento = require('../models/Orcamento');
const Ordem = require('../models/ordens');
const { nextCodigo: nextOsCodigo } = require('./ordemService');

function calcularTotais(itens = [], descontoTotal = 0) {
  const subtotal = itens.reduce((s, item) => {
    const qtd = Number(item.quantidade) || 1;
    const unit = Number(item.valorUnitario) || 0;
    const desc = Number(item.desconto) || 0;
    return s + (qtd * unit - desc);
  }, 0);
  const total = Math.max(0, subtotal - (Number(descontoTotal) || 0));
  return { subtotal, total };
}

async function nextCodigo(companyId) {
  const filter = companyId ? { companyId } : {};
  const last = await Orcamento.findOne(filter).sort({ numeroSequencial: -1 }).select('numeroSequencial');
  const numero = (last?.numeroSequencial || 0) + 1;
  return { codigo: `ORC-${String(numero).padStart(5, '0')}`, numeroSequencial: numero };
}

async function duplicar(orcamento, usuario) {
  const { codigo, numeroSequencial } = await nextCodigo(orcamento.companyId);
  const copia = await Orcamento.create({
    companyId: orcamento.companyId,
    codigo,
    numeroSequencial,
    versao: 1,
    versaoPaiId: orcamento._id,
    clienteId: orcamento.clienteId,
    clienteNome: orcamento.clienteNome,
    clienteEmail: orcamento.clienteEmail,
    clienteTelefone: orcamento.clienteTelefone,
    itens: orcamento.itens,
    subtotal: orcamento.subtotal,
    descontoTotal: orcamento.descontoTotal,
    total: orcamento.total,
    validade: orcamento.validade,
    observacoes: orcamento.observacoes,
    condicoesComerciais: orcamento.condicoesComerciais,
    criadoPor: usuario,
    historico: [{
      acao: 'duplicated',
      usuario,
      detalhes: { origem: orcamento.codigo }
    }]
  });
  return copia;
}

async function converterParaOS(orcamento, usuario) {
  if (orcamento.status !== 'aprovado') {
    const err = new Error('Orçamento precisa estar aprovado para converter em OS');
    err.status = 400;
    throw err;
  }

  const { codigo, numeroSequencial } = await nextOsCodigo(orcamento.companyId);
  const ordem = await Ordem.create({
    companyId: orcamento.companyId,
    codigo,
    numeroSequencial,
    cliente: orcamento.clienteNome,
    clienteId: orcamento.clienteId,
    descricao: `Convertido do orçamento ${orcamento.codigo}\n\n${orcamento.itens.map((i) => `- ${i.descricao} (${i.quantidade}x)`).join('\n')}`,
    valor: orcamento.total,
    status: 'Pendente',
    historico: [{ data: new Date(), descricao: `Gerada a partir do orçamento ${orcamento.codigo}`, usuario }],
    timeline: [{ data: new Date(), acao: 'from_orcamento', usuario, detalhes: { orcamentoId: orcamento._id } }]
  });

  orcamento.status = 'convertido';
  orcamento.ordemId = ordem._id;
  orcamento.historico.push({
    acao: 'converted_to_os',
    usuario,
    detalhes: { ordemId: ordem._id, codigo: ordem.codigo }
  });
  await orcamento.save();

  return { ordem, orcamento };
}

module.exports = {
  calcularTotais,
  nextCodigo,
  duplicar,
  converterParaOS
};
