(function (global) {
  const KEY = 'portal_token';
  const base = function () { return (global.LS_CONFIG?.apiBase || location.origin) + '/portal'; };

  function getToken() { return localStorage.getItem(KEY); }

  async function fetchPortal(path, opts) {
    const options = opts || {};
    options.headers = Object.assign({}, options.headers || {}, {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    });
    return fetch(base() + path, options);
  }

  async function login() {
    const email = document.getElementById('portalEmail').value.trim();
    const senha = document.getElementById('portalSenha').value.trim();
    const res = await fetch(base() + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, senha: senha })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login inválido');
    localStorage.setItem(KEY, data.token);
    mostrarApp();
    await carregarTudo();
  }

  function logout() {
    localStorage.removeItem(KEY);
    document.getElementById('portalLogin').style.display = 'grid';
    document.getElementById('portalApp').style.display = 'none';
  }

  function mostrarApp() {
    document.getElementById('portalLogin').style.display = 'none';
    document.getElementById('portalApp').style.display = 'block';
  }

  function abrirTab(tab, btn) {
    document.querySelectorAll('.portal-tab').forEach(function (s) { s.classList.remove('active'); });
    document.getElementById('tab-' + tab).classList.add('active');
    document.querySelectorAll('.portal-nav button').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
  }

  async function carregarTudo() {
    await Promise.all([carregarOrdens(), carregarOrcamentos(), carregarTickets()]);
  }

  async function carregarOrdens() {
    const res = await fetchPortal('/ordens');
    const ordens = await res.json();
    const box = document.getElementById('portalOrdens');
    box.innerHTML = ordens.map(function (o) {
      return '<div class="portal-card">' +
        '<strong>' + (o.codigo || 'OS') + '</strong> — ' + (o.status || '') +
        '<p>' + (o.descricao || '').slice(0, 120) + '</p>' +
        '<small>R$ ' + Number(o.valor || 0).toFixed(2) + '</small></div>';
    }).join('') || '<p>Nenhuma ordem</p>';
  }

  async function carregarOrcamentos() {
    const res = await fetchPortal('/orcamentos');
    const lista = await res.json();
    const box = document.getElementById('portalOrcamentos');
    box.innerHTML = lista.map(function (o) {
      const btn = o.status === 'enviado'
        ? '<button class="btn btn-success" onclick="PORTAL.aprovarOrc(\'' + o._id + '\')">Aprovar</button>'
        : '';
      return '<div class="portal-card">' +
        '<strong>' + o.codigo + '</strong> — ' + o.status +
        '<p>Total: R$ ' + Number(o.total || 0).toFixed(2) + '</p>' + btn + '</div>';
    }).join('') || '<p>Nenhum orçamento</p>';
  }

  async function aprovarOrc(id) {
    const res = await fetchPortal('/orcamentos/' + id + '/aprovar', { method: 'POST', body: '{}' });
    if (res.ok) {
      alert('Orçamento aprovado!');
      await carregarOrcamentos();
    }
  }

  async function carregarTickets() {
    const res = await fetchPortal('/tickets');
    const tickets = await res.json();
    const box = document.getElementById('portalTickets');
    box.innerHTML = tickets.map(function (t) {
      return '<div class="portal-card"><strong>' + t.codigo + '</strong> — ' + t.titulo +
        '<p>' + t.status + '</p></div>';
    }).join('') || '<p>Nenhum chamado</p>';
  }

  async function novoTicket() {
    const titulo = document.getElementById('ticketTitulo').value.trim();
    const descricao = document.getElementById('ticketDesc').value.trim();
    if (!titulo) return alert('Informe o título');
    const res = await fetchPortal('/tickets', {
      method: 'POST',
      body: JSON.stringify({ titulo: titulo, descricao: descricao })
    });
    if (res.ok) {
      document.getElementById('ticketTitulo').value = '';
      document.getElementById('ticketDesc').value = '';
      await carregarTickets();
    }
  }

  function init() {
    if (getToken()) {
      mostrarApp();
      carregarTudo();
    }
  }

  global.PORTAL = {
    login: login,
    logout: logout,
    abrirTab: abrirTab,
    novoTicket: novoTicket,
    aprovarOrc: aprovarOrc,
    init: init
  };
})(window);
