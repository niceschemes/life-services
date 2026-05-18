(function (global) {
  const STATUS_COLUMNS = [
    'Pendente',
    'Em andamento',
    'Aguardando cliente',
    'Orçamento enviado',
    'Concluída'
  ];

  function renderKanban(ordens) {
    const board = document.getElementById('kanbanBoard');
    if (!board) return;

    const grouped = {};
    STATUS_COLUMNS.forEach(function (s) { grouped[s] = []; });

    (ordens || []).forEach(function (o) {
      const status = o.status || 'Pendente';
      const key = STATUS_COLUMNS.find(function (c) {
        return status.toLowerCase().indexOf(c.toLowerCase().slice(0, 4)) >= 0;
      }) || 'Pendente';
      grouped[key].push(o);
    });

    board.innerHTML = STATUS_COLUMNS.map(function (col) {
      const cards = grouped[col].map(function (o) {
        return '<div class="ls-kanban-card" draggable="true" data-id="' + o._id + '" data-status="' + col + '">' +
          '<strong>' + (o.codigo || 'OS') + '</strong><br>' +
          '<span>' + (o.cliente || '') + '</span><br>' +
          '<small>' + (o.prioridade || 'Media') + ' · R$ ' + Number(o.valor || 0).toFixed(2) + '</small>' +
          '</div>';
      }).join('');

      return '<div class="ls-kanban-col" data-status="' + col + '"><h3>' + col + ' (' + grouped[col].length + ')</h3>' + cards + '</div>';
    }).join('');

    board.querySelectorAll('.ls-kanban-card').forEach(function (card) {
      card.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', card.dataset.id);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', function () {
        card.classList.remove('dragging');
      });
    });

    board.querySelectorAll('.ls-kanban-col').forEach(function (col) {
      col.addEventListener('dragover', function (e) { e.preventDefault(); });
      col.addEventListener('drop', async function (e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const status = col.dataset.status;
        if (!id || !global.cacheOrdens) return;

        const base = global.LS_CONFIG.apiBase;
        const res = await global.LS_API.fetchAuth(base + '/ordens/' + id, {
          method: 'PUT',
          body: JSON.stringify({ status: status })
        });

        if (res.ok) {
          global.LS_TOAST.success('Status atualizado');
          if (typeof global.carregarOrdens === 'function') global.carregarOrdens();
        }
      });
    });
  }

  async function runAssistant() {
    const prompt = document.getElementById('iaPrompt')?.value || '';
    const out = document.getElementById('iaOutput');
    if (!out) return;

    out.innerHTML = '<div class="ls-skeleton" style="height:80px"></div>';
    try {
      const res = await global.LS_API.apiV1('/ai/assistant', {
        method: 'POST',
        body: JSON.stringify({ prompt: prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na IA');

      out.innerHTML = '<div class="ls-ai-output">' + data.resumo + '\n\nSugestões:\n• ' +
        (data.sugestoes || []).join('\n• ') + '</div>';
    } catch (err) {
      out.textContent = err.message;
      global.LS_TOAST.error(err.message);
    }
  }

  async function loadExecutiveDashboard() {
    try {
      const res = await global.LS_API.apiV1('/dashboard/executive');
      if (!res.ok) return;
      const data = await res.json();
      const k = data.kpis || {};
      const el = function (id, val) {
        const node = document.getElementById(id);
        if (node) node.textContent = val;
      };
      if (k.faturamento !== undefined) {
        el('faturamento', 'R$ ' + Number(k.faturamento).toFixed(2));
      }
      if (k.ticketMedio !== undefined && document.getElementById('ticketMedio')) {
        el('ticketMedio', 'R$ ' + Number(k.ticketMedio).toFixed(2));
      }
    } catch (_) { /* API v1 opcional */ }
  }

  global.LS_ENTERPRISE = {
    renderKanban: renderKanban,
    runAssistant: runAssistant,
    loadExecutiveDashboard: loadExecutiveDashboard
  };
})(window);
