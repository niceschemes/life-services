(function (global) {
  let cache = [];

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
        '<td><strong>' + (o.codigo || '') + '</strong><br><small>v' + (o.versao || 1) + '</small></td>' +
        '<td>' + (o.clienteNome || '') + '</td>' +
        '<td><span class="' + statusClass + '">' + (o.status || '') + '</span></td>' +
        '<td>R$ ' + Number(o.total || 0).toFixed(2) + '</td>' +
        '<td class="actions">' +
        '<button class="btn btn-primary" onclick="LS_ORCAMENTOS.pdf(\'' + o._id + '\')">PDF</button> ' +
        '<button class="btn btn-warning" onclick="LS_ORCAMENTOS.duplicar(\'' + o._id + '\')">Duplicar</button> ' +
        (o.status === 'rascunho' ? '<button class="btn btn-success" onclick="LS_ORCAMENTOS.enviar(\'' + o._id + '\')">Enviar</button> ' : '') +
        (o.status === 'enviado' ? '<button class="btn btn-success" onclick="LS_ORCAMENTOS.aprovar(\'' + o._id + '\')">Aprovar</button> ' : '') +
        (o.status === 'aprovado' ? '<button class="btn btn-primary" onclick="LS_ORCAMENTOS.converterOS(\'' + o._id + '\')">→ OS</button> ' : '') +
        '<button class="btn btn-danger" onclick="LS_ORCAMENTOS.excluir(\'' + o._id + '\')">Excluir</button>' +
        '</td></tr>';
    }).join('') || '<tr><td colspan="5">Nenhum orçamento</td></tr>';
  }

  async function salvar() {
    try {
      const clienteNome = document.getElementById('orcCliente').value.trim();
      const desc = document.getElementById('orcItemDesc').value.trim();
      const qtd = Number(document.getElementById('orcItemQtd').value) || 1;
      const unit = Number(document.getElementById('orcItemValor').value) || 0;

      if (!clienteNome || !desc) {
        global.LS_TOAST.warning('Preencha cliente e item');
        return;
      }

      const body = {
        clienteNome,
        clienteEmail: document.getElementById('orcEmail').value.trim(),
        clienteTelefone: document.getElementById('orcTelefone').value.trim(),
        itens: [{ descricao: desc, quantidade: qtd, valorUnitario: unit, desconto: 0 }],
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
      document.getElementById('orcItemDesc').value = '';
      document.getElementById('orcItemValor').value = '';
      document.getElementById('orcObs').value = '';
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
      await listar();
      renderLista();
    } catch (e) {
      global.LS_TOAST.error(e.message);
    }
  }

  global.LS_ORCAMENTOS = {
    carregar: carregar,
    salvar: salvar,
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
})(window);
