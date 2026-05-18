(function (global) {
  const KEY = global.LS_CONFIG?.storageKeys?.theme || 'tema';

  function apply() {
    if (localStorage.getItem(KEY) === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    document.body.classList.add('ls-enterprise');
  }

  function toggle() {
    document.body.classList.toggle('light');
    localStorage.setItem(KEY, document.body.classList.contains('light') ? 'light' : 'dark');
  }

  function initSidebar() {
    const sidebar = document.querySelector('.ls-sidebar');
    const btn = document.getElementById('ls-toggle-sidebar');
    if (!sidebar || !btn) return;

    if (localStorage.getItem('ls_sidebar_collapsed') === '1') {
      sidebar.classList.add('collapsed');
    }

    btn.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('ls_sidebar_collapsed', sidebar.classList.contains('collapsed') ? '1' : '0');
    });
  }

  global.LS_THEME = { apply: apply, toggle: toggle, initSidebar: initSidebar };
  apply();
})(window);
