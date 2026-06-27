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
    function ensureEndpoint() {
      if(!endpoint) throw new Error('Google Sheets storage endpoint not configured.');
    }

    async function load() {
      ensureEndpoint();
      return createJsonpLoader({endpoint, key});
    }

    async function save(state) {
      ensureEndpoint();
      await fetchImpl(endpoint, {
        method:'POST',
        mode:'no-cors',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({
          action:'save',
          key,
          state
        })
      });
      return {ok:true};
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
