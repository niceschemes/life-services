(function (global) {
  const api = function (path) {
    return (global.LS_CONFIG?.apiBase || '') + '/chat' + path;
  };

  let mensagens = [];

  async function carregarHistorico() {
    const res = await global.LS_API.fetchAuth(api('/history?room=geral'));
    mensagens = await res.json();
    render();
  }

  function render() {
    const box = document.getElementById('chatMessages');
    if (!box) return;

    box.innerHTML = mensagens.map(function (m) {
      return '<div class="chat-bubble">' +
        '<strong>' + (m.remetenteNome || 'Usuário') + '</strong>' +
        '<p>' + escapeHtml(m.texto) + '</p>' +
        '<small>' + new Date(m.createdAt).toLocaleTimeString('pt-BR') + '</small>' +
        '</div>';
    }).join('') || '<p style="color:var(--muted)">Nenhuma mensagem ainda. Seja o primeiro!</p>';

    box.scrollTop = box.scrollHeight;
  }

  function escapeHtml(t) {
    return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function onRealtime(m) {
    mensagens.push(m);
    render();
    if (global.LS_TOAST && document.getElementById('chat') && !document.getElementById('chat').classList.contains('active')) {
      global.LS_TOAST.show('Nova mensagem de ' + (m.remetenteNome || 'equipe'), 'info');
    }
  }

  async function enviar() {
    const input = document.getElementById('chatInput');
    const texto = input?.value?.trim();
    if (!texto) return;

    try {
      if (global.LS_REALTIME) {
        await global.LS_REALTIME.sendChat(texto, 'geral');
      } else {
        await global.LS_API.fetchAuth(api('/send'), {
          method: 'POST',
          body: JSON.stringify({ texto: texto, room: 'geral' })
        });
        await carregarHistorico();
      }
      input.value = '';
    } catch (e) {
      global.LS_TOAST.error(e.message);
    }
  }

  global.LS_CHAT = {
    carregar: carregarHistorico,
    enviar: enviar,
    onRealtime: onRealtime
  };

  if (global.LS_REALTIME) {
    global.LS_REALTIME.on('chat', onRealtime);
  }
})(window);
