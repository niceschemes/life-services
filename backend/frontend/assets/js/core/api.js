(function (global) {
  function getToken() {
    return localStorage.getItem(global.LS_CONFIG.storageKeys.token);
  }

  async function fetchAuth(url, options) {
    const opts = options || {};
    opts.headers = Object.assign({}, opts.headers || {}, {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    });
    const res = await fetch(url, opts);
    if (res.status === 401) {
      localStorage.removeItem(global.LS_CONFIG.storageKeys.token);
      if (global.LS_TOAST) global.LS_TOAST.error('Sessão expirada. Faça login novamente.');
      setTimeout(function () { location.reload(); }, 800);
    }
    return res;
  }

  async function apiV1(path, options) {
    return fetchAuth(global.LS_CONFIG.apiV1() + path, options);
  }

  global.LS_API = { fetchAuth: fetchAuth, apiV1: apiV1, getToken: getToken };
})(window);
