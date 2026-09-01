const RECONNECT_DELAYS = [1_000,2_000,4_000,8_000,15_000];

function defaultSocketFactory() {
  const url = new URL('/ws', globalThis.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return new WebSocket(url);
}

export function createRealtimeClient({
  socketFactory = defaultSocketFactory,
  loadSnapshot,
  onSnapshot,
  onState,
  schedule = setTimeout,
  cancelSchedule = clearTimeout,
  onlineTarget = globalThis.window
}) {
  let state='offline';
  let socket=null;
  let reconnectTimer=null;
  let reconnectAttempt=0;
  let running=false;
  let browserOffline=false;
  let listening=false;

  const setState = next => {
    if (state === next) return;
    state=next;
    onState(next);
  };

  const clearReconnect = () => {
    if (reconnectTimer != null) cancelSchedule(reconnectTimer);
    reconnectTimer=null;
  };

  const parseMessage = event => {
    try {
      const message=JSON.parse(event.data);
      if (message?.type === 'snapshot' && message.snapshot) onSnapshot(message.snapshot);
    } catch {
      // Ignore malformed or unrelated server messages; the next reload stays authoritative.
    }
  };

  let openSocket;
  const scheduleReconnect = () => {
    if (!running || browserOffline || reconnectTimer != null) return;
    setState('reconnecting');
    const delay=RECONNECT_DELAYS[Math.min(reconnectAttempt,RECONNECT_DELAYS.length-1)];
    reconnectAttempt+=1;
    reconnectTimer=schedule(()=>{
      reconnectTimer=null;
      openSocket();
    },delay);
  };

  openSocket = () => {
    if (!running || browserOffline) return;
    clearReconnect();
    setState('reconnecting');
    const nextSocket=socketFactory('/ws');
    socket=nextSocket;
    nextSocket.addEventListener('message',parseMessage);
    nextSocket.addEventListener('open',async()=>{
      if (socket !== nextSocket || !running || browserOffline) return;
      try {
        const snapshot=await loadSnapshot();
        if (socket !== nextSocket || !running || browserOffline) return;
        onSnapshot(snapshot);
        reconnectAttempt=0;
        setState('online');
      } catch {
        if (socket === nextSocket) {
          try { nextSocket.close(); } catch { scheduleReconnect(); }
        }
      }
    });
    nextSocket.addEventListener('close',()=>{
      if (socket !== nextSocket) return;
      socket=null;
      if (!running || browserOffline) setState('offline');
      else scheduleReconnect();
    });
    nextSocket.addEventListener('error',()=>{
      if (socket === nextSocket) {
        try { nextSocket.close(); } catch { scheduleReconnect(); }
      }
    });
  };

  const handleOffline = () => {
    browserOffline=true;
    clearReconnect();
    const current=socket;
    socket=null;
    try { current?.close(); } catch {}
    setState('offline');
  };

  const handleOnline = () => {
    if (!running) return;
    browserOffline=false;
    reconnectAttempt=0;
    openSocket();
  };

  return {
    async connect() {
      if (running) return;
      running=true;
      browserOffline=false;
      if (!listening && onlineTarget?.addEventListener) {
        onlineTarget.addEventListener('offline',handleOffline);
        onlineTarget.addEventListener('online',handleOnline);
        listening=true;
      }
      openSocket();
    },
    disconnect() {
      running=false;
      browserOffline=false;
      clearReconnect();
      const current=socket;
      socket=null;
      try { current?.close(); } catch {}
      if (listening && onlineTarget?.removeEventListener) {
        onlineTarget.removeEventListener('offline',handleOffline);
        onlineTarget.removeEventListener('online',handleOnline);
        listening=false;
      }
      setState('offline');
    },
    getState() { return state; }
  };
}
