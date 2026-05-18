(function (global) {
  const apiBase = function (path) {
    return (global.LS_CONFIG?.apiBase || '') + path;
  };

  async function json(res) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro na operação');
    return data;
  }

  async function carregarPagamentos() {
    try {
      const [payments, sub] = await Promise.all([
        global.LS_API.fetchAuth(apiBase('/payments')).then(json),
        global.LS_API.fetchAuth(apiBase('/payments/subscription/mine')).then(json)
      ]);

      const tbody = document.getElementById('listaPagamentos');
      if (tbody) {
        tbody.innerHTML = payments.map(function (p) {
          const pix = p.pix?.copiaCola ? '<br><small>PIX: ' + p.pix.copiaCola.slice(0, 42) + '...</small>' : '';
          return '<tr>' +
            '<td>' + p.descricao + pix + '</td>' +
            '<td>' + p.provider + '</td>' +
            '<td>' + p.status + '</td>' +
            '<td>R$ ' + Number(p.valor || 0).toFixed(2) + '</td>' +
            '<td><button class="btn btn-success" onclick="LS_FASE4.confirmarPagamento(\'' + p._id + '\')">Confirmar</button></td>' +
            '</tr>';
        }).join('') || '<tr><td colspan="5">Nenhuma cobrança criada</td></tr>';
      }

      const subBox = document.getElementById('subscriptionBox');
      if (subBox) {
        subBox.innerHTML = '<div>Plano: <strong>' + sub.plano + '</strong></div>' +
          '<div>Status: <strong>' + sub.status + '</strong></div>' +
          '<div>MRR: R$ ' + Number(sub.valorMensal || 0).toFixed(2) + '</div>';
      }
    } catch (err) {
      global.LS_TOAST.error(err.message);
    }
  }

  async function criarPagamento() {
    try {
      const body = {
        descricao: document.getElementById('payDescricao').value.trim(),
        valor: Number(document.getElementById('payValor').value || 0),
        provider: document.getElementById('payProvider').value
      };
      if (!body.descricao || !body.valor) {
        global.LS_TOAST.warning('Preencha descrição e valor');
        return;
      }

      await global.LS_API.fetchAuth(apiBase('/payments'), {
        method: 'POST',
        body: JSON.stringify(body)
      }).then(json);

      global.LS_TOAST.success('Cobrança criada');
      await carregarPagamentos();
    } catch (err) {
      global.LS_TOAST.error(err.message);
    }
  }

  async function confirmarPagamento(id) {
    try {
      await global.LS_API.fetchAuth(apiBase('/payments/' + id + '/confirmar'), {
        method: 'PATCH'
      }).then(json);
      global.LS_TOAST.success('Pagamento confirmado');
      await carregarPagamentos();
    } catch (err) {
      global.LS_TOAST.error(err.message);
    }
  }

  async function carregarAutomacoes() {
    try {
      const rules = await global.LS_API.fetchAuth(apiBase('/automations')).then(json);
      const box = document.getElementById('listaAutomacoes');
      if (!box) return;

      box.innerHTML = rules.map(function (r) {
        return '<div>' +
          '<strong>' + r.nome + '</strong><br>' +
          '<small>Trigger: ' + r.trigger + ' · Execuções: ' + (r.runCount || 0) + '</small><br>' +
          '<button class="btn btn-primary" style="margin-top:8px;" onclick="LS_FASE4.executarAutomacao(\'' + r._id + '\')">Executar</button>' +
          '</div>';
      }).join('') || '<div>Nenhuma automação</div>';
    } catch (err) {
      global.LS_TOAST.error(err.message);
    }
  }

  async function criarAutomacao() {
    try {
      const body = {
        nome: document.getElementById('autoNome').value.trim(),
        descricao: document.getElementById('autoDescricao').value.trim(),
        trigger: document.getElementById('autoTrigger').value,
        actions: [{
          type: 'notificacao',
          titulo: document.getElementById('autoNome').value.trim() || 'Automação',
          mensagem: document.getElementById('autoDescricao').value.trim() || 'Workflow executado'
        }]
      };
      await global.LS_API.fetchAuth(apiBase('/automations'), {
        method: 'POST',
        body: JSON.stringify(body)
      }).then(json);
      global.LS_TOAST.success('Automação criada');
      await carregarAutomacoes();
    } catch (err) {
      global.LS_TOAST.error(err.message);
    }
  }

  async function executarAutomacao(id) {
    try {
      await global.LS_API.fetchAuth(apiBase('/automations/' + id + '/run'), {
        method: 'POST',
        body: '{}'
      }).then(json);
      global.LS_TOAST.success('Automação executada');
      await carregarAutomacoes();
    } catch (err) {
      global.LS_TOAST.error(err.message);
    }
  }

  async function setup2FA() {
    try {
      const data = await global.LS_API.fetchAuth(apiBase('/security/2fa/setup'), {
        method: 'POST',
        body: '{}'
      }).then(json);
      const box = document.getElementById('securityOutput');
      box.innerHTML = 'Código 2FA demo: <strong>' + data.demoCode + '</strong>';
      global.LS_TOAST.success('Código 2FA gerado');
    } catch (err) {
      global.LS_TOAST.error(err.message);
    }
  }

  async function verify2FA() {
    try {
      const code = document.getElementById('twoFactorCode').value.trim();
      await global.LS_API.fetchAuth(apiBase('/security/2fa/verify'), {
        method: 'POST',
        body: JSON.stringify({ code: code })
      }).then(json);
      global.LS_TOAST.success('2FA ativado');
    } catch (err) {
      global.LS_TOAST.error(err.message);
    }
  }

  async function resetSenhaDemo() {
    try {
      const usuarioOuEmail = document.getElementById('resetUser').value.trim();
      const data = await fetch(apiBase('/security/password/request-reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioOuEmail: usuarioOuEmail })
      }).then(json);
      document.getElementById('securityOutput').innerHTML = 'Token reset demo: <strong>' + (data.demoResetToken || 'enviado') + '</strong>';
    } catch (err) {
      global.LS_TOAST.error(err.message);
    }
  }

  async function carregarMaster() {
    try {
      const data = await global.LS_API.fetchAuth(apiBase('/master/overview')).then(json);
      const box = document.getElementById('masterOverview');
      if (!box) return;
      const k = data.kpis;
      box.innerHTML = '<div>Empresas: <strong>' + k.empresas + '</strong></div>' +
        '<div>Usuários: <strong>' + k.usuarios + '</strong></div>' +
        '<div>Clientes: <strong>' + k.clientes + '</strong></div>' +
        '<div>Ordens: <strong>' + k.ordens + '</strong></div>' +
        '<div>MRR SaaS: <strong>R$ ' + Number(k.mrr || 0).toFixed(2) + '</strong></div>' +
        '<div>Receita confirmada: <strong>R$ ' + Number(k.receitaConfirmada || 0).toFixed(2) + '</strong></div>';
    } catch (err) {
      document.getElementById('masterOverview').innerHTML = '<div>Disponível apenas para super admin.</div>';
    }
  }

  global.LS_FASE4 = {
    carregarPagamentos,
    criarPagamento,
    confirmarPagamento,
    carregarAutomacoes,
    criarAutomacao,
    executarAutomacao,
    setup2FA,
    verify2FA,
    resetSenhaDemo,
    carregarMaster
  };
})(window);
