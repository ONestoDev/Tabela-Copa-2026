(function () {
  const storageKey = 'copa2026-novo';

  function createInitialState() {
    return {
      scores: {},
      knockoutScores: {},
      predictions: {},
      knockoutPredictions: {},
      users: ['Usuário 1'],
      activeUser: 'Usuário 1',
      theme: 'dark',
      resultsFilter: 'all',
      thirds: [],
      history: [],
      future: []
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function save(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function load() {
    const raw = localStorage.getItem(storageKey);
    if(!raw) return null;
    return JSON.parse(raw);
  }

  window.AppState = {
    createInitialState,
    clone,
    save,
    load
  };
})();
