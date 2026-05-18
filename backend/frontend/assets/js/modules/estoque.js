(function (global) {
  const api = function (path) {
    return global.LS_CONFIG.apiBase + '/estoque' + path;
  };

  let produtos = [];

  async function carregar() {
    const [resP, resA] = await Promise.all([
      global.LS_API.fetchAuth(api('/produtos')),
      global.LS_API.fetchAuth(api('/alertas'))
    ]);
    produtos = await resP.json();
    const alertas = await resA.json();

    renderProdutos();
    renderAlertas(alertas);

    const hist = await global.LS_API.fetchAuth(api('/movimentacoes'));
    const movs = await hist.json();
    renderMovimentacoes(movs);
  }

  function renderProdutos() {
    const tbody = document.getElementById('listaEstoque');
    if (!tbody) return;

    tbody.innerHTML = produtos.map(function (p) {
      const baixo = p.estoqueAtual <= p.estoqueMinimo;
      return '<tr class="' + (baixo ? 'estoque-baixo' : '') + '">' +
        '<td>' + (p.nome || '') + '<br><small>' + (p.sku || '') + '</small></td>' +
        '<td>' + p.estoqueAtual + ' ' + (p.unidade || 'UN') + '</td>' +
        '<td>' + p.estoqueMinimo + '</td>' +
        '<td>R$ ' + Number(p.custoMedio || 0).toFixed(2) + '</td>' +
        '<td>R$ ' + Number(p.precoVenda || 0).toFixed(2) + '</td>' +
        '<td class="actions">' +
        '<button class="btn btn-success" onclick="LS_ESTOQUE.mov(\'' + p._id + '\',\'entrada\')">+ Entrada</button> ' +
        '<button class="btn btn-warning" onclick="LS_ESTOQUE.mov(\'' + p._id + '\',\'saida\')">- Saída</button>' +
        '</td></tr>';
    }).join('') || '<tr><td colspan="6">Nenhum produto</td></tr>';
  }

  function renderAlertas(alertas) {
    const box = document.getElementById('estoqueAlertas');
    if (!box) return;
    box.innerHTML = alertas.length
      ? alertas.map(function (p) {
        return '<div class="ls-toast warning" style="position:static;margin-bottom:8px;">⚠ ' + p.nome + ' — estoque ' + p.estoqueAtual + ' (mín. ' + p.estoqueMinimo + ')</div>';
      }).join('')
      : '<div>Nenhum alerta de estoque baixo</div>';
  }

  function renderMovimentacoes(movs) {
    const box = document.getElementById('listaMovimentacoes');
    if (!box) return;
    box.innerHTML = (movs || []).slice(0, 15).map(function (m) {
      return '<div>' + m.tipo.toUpperCase() + ' · ' + m.produtoNome + ' · ' + m.quantidade + ' — ' + (m.motivo || '') + '</div>';
    }).join('') || '<div>Nenhuma movimentação</div>';
  }

  async function salvarProduto() {
    const body = {
      nome: document.getElementById('estNome').value.trim(),
      sku: document.getElementById('estSku').value.trim(),
      estoqueAtual: Number(document.getElementById('estQtd').value) || 0,
      estoqueMinimo: Number(document.getElementById('estMin').value) || 0,
      custoMedio: Number(document.getElementById('estCusto').value) || 0,
      precoVenda: Number(document.getElementById('estPreco').value) || 0
    };
    if (!body.nome) {
      global.LS_TOAST.warning('Nome do produto obrigatório');
      return;
    }
    const res = await global.LS_API.fetchAuth(api('/produtos'), {
      method: 'POST',
      body: JSON.stringify(body)
    });
    if (res.ok) {
      global.LS_TOAST.success('Produto cadastrado');
      await carregar();
    }
  }

  async function mov(id, tipo) {
    const qtd = prompt('Quantidade:', '1');
    if (!qtd) return;
    const res = await global.LS_API.fetchAuth(api('/produtos/' + id + '/movimentar'), {
      method: 'POST',
      body: JSON.stringify({ tipo: tipo, quantidade: Number(qtd), motivo: 'Ajuste manual' })
    });
    const data = await res.json();
    if (!res.ok) {
      global.LS_TOAST.error(data.error || 'Erro');
      return;
    }
    global.LS_TOAST.success('Movimentação registrada');
    await carregar();
  }

  global.LS_ESTOQUE = { carregar: carregar, salvarProduto: salvarProduto, mov: mov };
})(window);
