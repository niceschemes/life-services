(function (global) {
  let socket = null;
  const handlers = { notification: [], chat: [] };

  function on(event, fn) {
    if (handlers[event]) handlers[event].push(fn);
  }

  function emit(event, data) {
    (handlers[event] || []).forEach(function (fn) { fn(data); });
  }

  function connect() {
    const token = localStorage.getItem(global.LS_CONFIG?.storageKeys?.token || 'token');
    if (!token || typeof io === 'undefined') return;

    if (socket && socket.connected) return socket;

    const base = global.LS_CONFIG?.apiBase || location.origin;
    socket = io(base, {
      auth: { token: token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', function () {
      socket.emit('chat:join', 'geral');
    });

    socket.on('notification', function (n) {
      emit('notification', n);
    });

    socket.on('chat:message', function (m) {
      emit('chat', m);
    });

    socket.on('connect_error', function () {
      console.warn('WebSocket: reconectando...');
    });

    return socket;
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  function sendChat(texto, room) {
    if (!socket) return Promise.reject(new Error('Sem conexão'));
    return new Promise(function (resolve, reject) {
      socket.emit('chat:send', { texto: texto, room: room || 'geral' }, function (res) {
        if (res && res.ok) resolve(res.message);
        else reject(new Error(res?.error || 'Erro ao enviar'));
      });
    });
  }

  global.LS_REALTIME = { connect: connect, disconnect: disconnect, on: on, sendChat: sendChat };
})(window);
