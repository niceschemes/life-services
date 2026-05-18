(function (global) {
  let cache = [];
  let itemSeq = 0;

  function money(value) {
    return 'R$ ' + Number(value || 0).toFixed(2).replace('.', ',');
  }

  function base() {
    return global.LS_CONFIG.apiBase + '/orcamentos';
  }

  async function listar() {
    const res = await global.LS_API.fetchAuth(base());
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao carregar orçamentos');
    cache = data;
    return data;
  }

  function renderLista() {
    const tbody = document.getElementById('listaOrcamentos');
    if (!tbody) return;

    tbody.innerHTML = cache.map(function (o) {
      const statusClass = 'badge-status status-' + (o.status || 'rascunho');
      return '<tr>' +
        '<td data-label="Código"><strong>' + (o.codigo || '') + '</strong><br><small>v' + (o.versao || 1) + '</small></td>' +
        '<td data-label="Cliente">' + (o.clienteNome || '') + '</td>' +
        '<td data-label="Status"><span class="' + statusClass + '">' + (o.status || '') + '</span></td>' +
        '<td data-label="Total">' + money(o.total) + '</td>' +
        '<td data-label="Ações" class="actions">' +
        '<button class="btn btn-primary" onclick="LS_ORCAMENTOS.pdf(\'' + o._id + '\')">PDF</button> ' +
        '<button class="btn btn-warning" onclick="LS_ORCAMENTOS.duplicar(\'' + o._id + '\')">Duplicar</button> ' +
        (o.status === 'rascunho' ? '<button class="btn btn-success" onclick="LS_ORCAMENTOS.enviar(\'' + o._id + '\')">Enviar</button> ' : '') +
        (o.status === 'enviado' ? '<button class="btn btn-success" onclick="LS_ORCAMENTOS.aprovar(\'' + o._id + '\')">Aprovar</button> ' : '') +
        (o.status === 'aprovado' ? '<button class="btn btn-primary" onclick="LS_ORCAMENTOS.converterOS(\'' + o._id + '\')">→ OS</button> ' : '') +
        '<button class="btn btn-danger" onclick="LS_ORCAMENTOS.excluir(\'' + o._id + '\')">Excluir</button>' +
        '</td></tr>';
    }).join('') || '<tr><td colspan="5">Nenhum orçamento</td></tr>';
  }

  function adicionarItem(item) {
    const box = document.getElementById('orcItens');
    if (!box) return;
    itemSeq += 1;
    const row = document.createElement('div');
    row.className = 'budget-item';
    row.dataset.itemId = String(itemSeq);
    row.innerHTML =
      '<input class="orc-item-desc" placeholder="Descrição do item ou serviço *" value="' + (item?.descricao || '') + '">' +
      '<input class="orc-item-qtd" type="number" min="1" step="1" value="' + (item?.quantidade || 1) + '" placeholder="Qtd">' +
      '<input class="orc-item-valor" type="number" min="0" step="0.01" value="' + (item?.valorUnitario || '') + '" placeholder="Valor unitário *">' +
      '<strong class="orc-item-total">R$ 0,00</strong>' +
      '<button class="btn btn-danger" type="button" title="Remover item">Remover</button>';

    row.querySelector('button').addEventListener('click', function () {
      row.remove();
      if (!box.querySelector('.budget-item')) adicionarItem();
      atualizarTotal();
    });
    row.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', atualizarTotal);
    });
    box.appendChild(row);
    atualizarTotal();
  }

  function garantirItemInicial() {
    const box = document.getElementById('orcItens');
    if (box && !box.querySelector('.budget-item')) adicionarItem();
  }

  function coletarItens() {
    garantirItemInicial();
    return Array.from(document.querySelectorAll('#orcItens .budget-item')).map(function (row) {
      return {
        descricao: row.querySelector('.orc-item-desc').value.trim(),
        quantidade: Number(row.querySelector('.orc-item-qtd').value) || 1,
        valorUnitario: Number(row.querySelector('.orc-item-valor').value) || 0,
        desconto: 0
      };
    }).filter(function (item) {
      return item.descricao && item.valorUnitario > 0;
    });
  }

  function atualizarTotal() {
    const total = Array.from(document.querySelectorAll('#orcItens .budget-item')).reduce(function (sum, row) {
      const qtd = Number(row.querySelector('.orc-item-qtd').value) || 0;
      const unit = Number(row.querySelector('.orc-item-valor').value) || 0;
      const linha = qtd * unit;
      const totalEl = row.querySelector('.orc-item-total');
      if (totalEl) totalEl.textContent = money(linha);
      return sum + linha;
    }, 0);
    const preview = document.getElementById('orcTotalPreview');
    if (preview) preview.textContent = money(total);
  }

  function limparFormulario() {
    document.getElementById('orcItemDesc')?.remove();
    document.getElementById('orcItemQtd')?.remove();
    document.getElementById('orcItemValor')?.remove();
    document.getElementById('orcObs').value = '';
    const box = document.getElementById('orcItens');
    if (box) box.innerHTML = '';
    adicionarItem();
  }

  async function salvar() {
    try {
      garantirItemInicial();
      const clienteNome = document.getElementById('orcCliente').value.trim();
      const itens = coletarItens();

      if (!clienteNome || !itens.length) {
        global.LS_TOAST.warning('Preencha o cliente e pelo menos um item com valor');
        return;
      }

      const body = {
        clienteNome,
        clienteEmail: document.getElementById('orcEmail').value.trim(),
        clienteTelefone: document.getElementById('orcTelefone').value.trim(),
        itens: itens,
        observacoes: document.getElementById('orcObs').value.trim(),
        validade: document.getElementById('orcValidade').value ? new Date(document.getElementById('orcValidade').value) : undefined
      };

      const res = await global.LS_API.fetchAuth(base(), {
        method: 'POST',
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');

      cache.unshift(data);
      renderLista();

      global.LS_TOAST.success('Orçamento ' + data.codigo + ' criado');
      limparFormulario();
      await carregar();
    } catch (e) {
      global.LS_TOAST.error(e.message);
    }
  }

  async function acao(id, path, msg) {
    const res = await global.LS_API.fetchAuth(base() + '/' + id + path, { method: 'POST', body: '{}' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro');
    global.LS_TOAST.success(msg);
    await carregar();
    if (path === '/converter-os' && data.ordem) {
      global.LS_TOAST.success('OS criada: ' + (data.ordem.codigo || data.ordem._id));
      if (typeof global.carregarOrdens === 'function') global.carregarOrdens();
    }
  }

  async function carregar() {
    try {
      garantirItemInicial();
      await listar();
      renderLista();
    } catch (e) {
      global.LS_TOAST.error(e.message);
    }
  }

  global.LS_ORCAMENTOS = {
    carregar: carregar,
    salvar: salvar,
    adicionarItem: adicionarItem,
    atualizarTotal: atualizarTotal,
    duplicar: function (id) { return acao(id, '/duplicar', 'Orçamento duplicado'); },
    enviar: function (id) { return acao(id, '/enviar', 'Orçamento enviado'); },
    aprovar: function (id) { return acao(id, '/aprovar', 'Orçamento aprovado'); },
    rejeitar: function (id) { return acao(id, '/rejeitar', 'Orçamento rejeitado'); },
    converterOS: function (id) { return acao(id, '/converter-os', 'Convertido em OS'); },
    excluir: async function (id) {
      if (!confirm('Excluir orçamento?')) return;
      const res = await global.LS_API.fetchAuth(base() + '/' + id, { method: 'DELETE' });
      if (res.ok) { global.LS_TOAST.success('Excluído'); await carregar(); }
    },
    pdf: async function (id) {
      try {
        const res = await global.LS_API.fetchAuth(base() + '/' + id + '/pdf');
        if (!res.ok) throw new Error('Erro ao gerar PDF');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (e) {
        global.LS_TOAST.error(e.message);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', garantirItemInicial);
  } else {
    garantirItemInicial();
  }
})(window);
