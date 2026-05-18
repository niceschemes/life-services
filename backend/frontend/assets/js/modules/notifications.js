(function (global) {
  const api = function (path) {
    return (global.LS_CONFIG?.apiBase || '') + '/notifications' + path;
  };

  let lista = [];

  async function carregar() {
    const res = await global.LS_API.fetchAuth(api(''));
    lista = await res.json();
    renderPainel();
    atualizarBadge();
  }

  async function atualizarBadge() {
    const res = await global.LS_API.fetchAuth(api('/unread-count'));
    const data = await res.json();
    const dot = document.querySelector('.notif-bell .dot');
    if (dot) dot.style.display = (data.count > 0) ? 'block' : 'none';
    const badge = document.getElementById('notifCount');
    if (badge) badge.textContent = data.count || 0;
  }

  function renderPainel() {
    const box = document.getElementById('notifPanelList');
    if (!box) return;

    box.innerHTML = lista.length
      ? lista.slice(0, 20).map(function (n) {
        return '<div class="notif-item ' + (n.lida ? '' : 'unread') + '" data-id="' + n._id + '">' +
          '<strong>' + (n.titulo || '') + '</strong>' +
          '<p>' + (n.mensagem || '') + '</p>' +
          '<small>' + new Date(n.createdAt).toLocaleString('pt-BR') + '</small>' +
          '</div>';
      }).join('')
      : '<p class="notif-empty">Nenhuma notificação</p>';

    box.querySelectorAll('.notif-item').forEach(function (el) {
      el.addEventListener('click', function () {
        marcarLida(el.dataset.id);
      });
    });
  }

  function onRealtime(n) {
    lista.unshift(n);
    if (global.LS_TOAST) global.LS_TOAST.show(n.titulo || 'Nova notificação', n.critica ? 'warning' : 'info');
    renderPainel();
    atualizarBadge();
  }

  async function marcarLida(id) {
    await global.LS_API.fetchAuth(api('/' + id + '/read'), { method: 'PATCH' });
    const item = lista.find(function (x) { return x._id === id; });
    if (item) item.lida = true;
    renderPainel();
    atualizarBadge();
  }

  async function marcarTodas() {
    await global.LS_API.fetchAuth(api('/read-all'), { method: 'PATCH' });
    lista.forEach(function (n) { n.lida = true; });
    renderPainel();
    atualizarBadge();
  }

  function togglePainel() {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) carregar();
  }

  global.LS_NOTIFICATIONS = {
    carregar: carregar,
    onRealtime: onRealtime,
    togglePainel: togglePainel,
    marcarTodas: marcarTodas
  };

  if (global.LS_REALTIME) {
    global.LS_REALTIME.on('notification', onRealtime);
  }
})(window);
