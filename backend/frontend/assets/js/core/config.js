(function (global) {
  const origin = global.location?.origin || '';
  const isLocal = /localhost|127\.0\.0\.1/.test(origin);

  global.LS_CONFIG = {
    apiBase: isLocal ? origin : (global.LS_API_BASE || origin || 'https://life-services-wiq6.onrender.com'),
    apiV1: function () {
      return this.apiBase + '/api/v1';
    },
    storageKeys: {
      token: 'token',
      refresh: 'ls_refresh',
      user: 'ls_user',
      company: 'ls_company',
      theme: 'tema',
      sidebar: 'ls_sidebar_collapsed'
    }
  };
})(window);
