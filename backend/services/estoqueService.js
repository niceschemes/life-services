const Produto = require('../models/Produto');
const MovimentacaoEstoque = require('../models/MovimentacaoEstoque');

async function registrarMovimentacao({
  companyId,
  produtoId,
  tipo,
  quantidade,
  custoUnitario,
  motivo,
  ordemId,
  usuario
}) {
  const produto = await Produto.findOne({ _id: produtoId, ...(companyId ? { companyId } : {}) });
  if (!produto) {
    const err = new Error('Produto não encontrado');
    err.status = 404;
    throw err;
  }

  const qtd = Number(quantidade);
  if (qtd <= 0) {
    const err = new Error('Quantidade inválida');
    err.status = 400;
    throw err;
  }

  if (tipo === 'saida' && produto.estoqueAtual < qtd) {
    const err = new Error('Estoque insuficiente');
    err.status = 400;
    throw err;
  }

  if (tipo === 'entrada' && custoUnitario > 0) {
    const totalAtual = produto.estoqueAtual * produto.custoMedio;
    const novoTotal = totalAtual + qtd * custoUnitario;
    const novoEstoque = produto.estoqueAtual + qtd;
    produto.custoMedio = novoEstoque > 0 ? novoTotal / novoEstoque : custoUnitario;
    produto.estoqueAtual = novoEstoque;
  } else if (tipo === 'entrada') {
    produto.estoqueAtual += qtd;
  } else if (tipo === 'saida') {
    produto.estoqueAtual -= qtd;
  } else if (tipo === 'ajuste') {
    produto.estoqueAtual = qtd;
  }

  if (produto.precoVenda > 0 && produto.custoMedio > 0) {
    produto.margem = ((produto.precoVenda - produto.custoMedio) / produto.precoVenda) * 100;
  }

  await produto.save();

  const mov = await MovimentacaoEstoque.create({
    companyId: companyId || produto.companyId,
    produtoId: produto._id,
    produtoNome: produto.nome,
    tipo,
    quantidade: qtd,
    custoUnitario: custoUnitario || produto.custoMedio,
    motivo,
    ordemId,
    usuario
  });

  return { produto, movimentacao: mov };
}

async function alertasEstoqueBaixo(companyId) {
  const filter = { ativo: true, ...(companyId ? { companyId } : {}) };
  const produtos = await Produto.find(filter).lean();
  return produtos.filter((p) => p.estoqueAtual <= p.estoqueMinimo);
}

module.exports = { registrarMovimentacao, alertasEstoqueBaixo };
