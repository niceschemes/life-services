(function (global) {
  function expireSession() {
    if (global.LS_SESSION_EXPIRED) return;
    global.LS_SESSION_EXPIRED = true;

    sessionStorage.removeItem(global.LS_CONFIG.storageKeys.token);
    sessionStorage.removeItem('pending_2fa_code');
    sessionStorage.removeItem('ls_user');
    sessionStorage.removeItem('ls_company');
    sessionStorage.removeItem('ls_refresh');

    if (global.LS_REALTIME) global.LS_REALTIME.disconnect();

    const loginBox = document.getElementById('loginBox');
    const app = document.getElementById('app');
    if (loginBox) loginBox.style.display = 'flex';
    if (app) app.style.display = 'none';

    if (global.LS_TOAST) {
      global.LS_TOAST.error('Sessão expirada. Faça login novamente.');
    }
  }

  function getToken() {
    return sessionStorage.getItem(global.LS_CONFIG.storageKeys.token);
  }

  async function fetchAuth(url, options) {
    const token = getToken();
    if (!token) {
      expireSession();
      return new Response(JSON.stringify({ error: 'Sem sessão ativa' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const opts = options || {};
    opts.headers = Object.assign({}, opts.headers || {}, {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    });
    const res = await fetch(url, opts);
    if (res.status === 401) {
      expireSession();
    }
    return res;
  }

  async function apiV1(path, options) {
    return fetchAuth(global.LS_CONFIG.apiV1() + path, options);
  }

  global.LS_API = { fetchAuth: fetchAuth, apiV1: apiV1, getToken: getToken };
})(window);
