(function (global) {
  let pipelineData = null;

  async function carregar() {
    const res = await global.LS_API.fetchAuth(global.LS_CONFIG.apiBase + '/crm/pipeline');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro CRM');
    pipelineData = data;
    render();
  }

  function render() {
    const board = document.getElementById('crmPipeline');
    if (!board || !pipelineData) return;

    board.innerHTML = (pipelineData.stages || []).map(function (stage) {
      const cards = (pipelineData.board[stage.id] || []).map(function (c) {
        return '<div class="ls-kanban-card crm-card" draggable="true" data-id="' + c._id + '" data-etapa="' + stage.id + '">' +
          '<strong>' + (c.nome || '') + '</strong><br>' +
          '<small>' + (c.telefone || c.email || '') + '</small><br>' +
          '<small>Score: ' + (c.score || 0) + '</small>' +
          '</div>';
      }).join('');

      return '<div class="ls-kanban-col crm-col" data-etapa="' + stage.id + '" style="border-top:3px solid ' + stage.cor + '">' +
        '<h3>' + stage.label + ' (' + (pipelineData.board[stage.id] || []).length + ')</h3>' +
        cards +
        '</div>';
    }).join('');

    board.querySelectorAll('.crm-card').forEach(bindDrag);
    board.querySelectorAll('.crm-col').forEach(bindDrop);
  }

  function bindDrag(card) {
    card.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
    });
  }

  function bindDrop(col) {
    col.addEventListener('dragover', function (e) { e.preventDefault(); });
    col.addEventListener('drop', async function (e) {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const etapa = col.dataset.etapa;
      const res = await global.LS_API.fetchAuth(
        global.LS_CONFIG.apiBase + '/crm/clientes/' + id + '/etapa',
        { method: 'PATCH', body: JSON.stringify({ etapa: etapa }) }
      );
      if (res.ok) {
        global.LS_TOAST.success('Cliente movido no funil');
        await carregar();
      }
    });
  }

  async function followUp() {
    const id = document.getElementById('crmFollowClienteId').value.trim();
    const nota = document.getElementById('crmFollowNota').value.trim();
    if (!id || !nota) {
      global.LS_TOAST.warning('Informe ID do cliente e nota');
      return;
    }
    const res = await global.LS_API.fetchAuth(
      global.LS_CONFIG.apiBase + '/crm/clientes/' + id + '/followup',
      { method: 'POST', body: JSON.stringify({ nota: nota }) }
    );
    if (res.ok) {
      global.LS_TOAST.success('Follow-up registrado');
      document.getElementById('crmFollowNota').value = '';
    }
  }

  global.LS_CRM = { carregar: carregar, followUp: followUp };
})(window);
