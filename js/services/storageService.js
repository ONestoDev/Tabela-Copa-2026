(function () {
  const defaultKey = 'copa2026-novo';

  function createLocalStorage(key = defaultKey) {
    function save(state) {
      localStorage.setItem(key, JSON.stringify(state));
    }

    function load() {
      const raw = localStorage.getItem(key);
      if(!raw) return null;
      return JSON.parse(raw);
    }

    return {
      save,
      load
    };
  }

  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function stateFreshness(state) {
    if(!state || typeof state !== 'object') return 0;
    return Number(state.updatedAt) || 0;
  }

  function createJsonpLoader({endpoint, key, timeoutMs = 10000}) {
    return new Promise((resolve, reject) => {
      const callbackName = `copa2026Storage${Date.now()}${Math.random().toString(16).slice(2)}`;
      const separator = endpoint.includes('?') ? '&' : '?';
      const script = document.createElement('script');
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Google Sheets load timed out.'));
      }, timeoutMs);

      function cleanup() {
        clearTimeout(timer);
        delete window[callbackName];
        if(script.parentNode) script.parentNode.removeChild(script);
      }

      window[callbackName] = payload => {
        cleanup();
        resolve(payload.state || payload.data || null);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('Google Sheets load failed.'));
      };
      script.src = `${endpoint}${separator}action=load&key=${encodeURIComponent(key)}&callback=${callbackName}`;
      document.body.appendChild(script);
    });
  }

  function createGoogleSheetsStorage({endpoint, key = defaultKey, fetchImpl = fetch}) {
    const localStorageFallback = createLocalStorage(key);
    let remoteSaveQueue = Promise.resolve();

    function ensureEndpoint() {
      if(!endpoint) throw new Error('Google Sheets storage endpoint not configured.');
    }

    async function saveRemote(snapshot) {
      await fetchImpl(endpoint, {
        method:'POST',
        mode:'no-cors',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({
          action:'save',
          key,
          state:snapshot
        })
      });
      return {ok:true};
    }

    async function load() {
      ensureEndpoint();
      let localState = null;
      try {
        localState = localStorageFallback.load();
      } catch (error) {}
      let remoteState = null;
      try {
        remoteState = await createJsonpLoader({endpoint, key});
      } catch (error) {
        return localState;
      }
      if(!remoteState) return localState;
      if(!localState) return remoteState;
      if(stateFreshness(localState) > stateFreshness(remoteState)) {
        remoteSaveQueue = remoteSaveQueue.catch(() => {}).then(() => saveRemote(cloneState(localState)));
        return localState;
      }
      localStorageFallback.save(remoteState);
      return remoteState;
    }

    async function save(state) {
      ensureEndpoint();
      const snapshot = cloneState(state);
      localStorageFallback.save(snapshot);
      remoteSaveQueue = remoteSaveQueue.catch(() => {}).then(() => saveRemote(snapshot));
      return remoteSaveQueue;
    }

    return {
      save,
      load
    };
  }

  function create(config) {
    if(config && config.provider === 'googleSheets') {
      return createGoogleSheetsStorage(config);
    }
    return createLocalStorage(config?.key || defaultKey);
  }

  window.StorageService = {
    create,
    createLocalStorage,
    createGoogleSheetsStorage
  };
})();
