(function (global) {
  function ensureHost() {
    let host = document.getElementById('ls-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'ls-toast-host';
      host.className = 'ls-toast-host';
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(message, type) {
    const host = ensureHost();
    const el = document.createElement('div');
    el.className = 'ls-toast ' + (type || 'info');
    el.textContent = message;
    host.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(12px)';
      setTimeout(function () { el.remove(); }, 300);
    }, 4200);
  }

  global.LS_TOAST = {
    show: toast,
    success: function (m) { toast(m, 'success'); },
    error: function (m) { toast(m, 'error'); },
    warning: function (m) { toast(m, 'warning'); }
  };
})(window);
