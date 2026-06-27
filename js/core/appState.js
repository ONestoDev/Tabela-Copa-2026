(function () {
  function defaultUserName() {
    return 'Usu\u00e1rio 1';
  }

  function createInitialState() {
    return {
      scores: {},
      knockoutScores: {},
      predictions: {},
      knockoutPredictions: {},
      users: [defaultUserName()],
      activeUser: defaultUserName(),
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

  function normalize(state, resultPhases) {
    state.scores = state.scores || {};
    state.knockoutScores = state.knockoutScores || {};
    state.predictions = state.predictions || {};
    state.knockoutPredictions = state.knockoutPredictions || {};
    state.users = Array.isArray(state.users) && state.users.length ? state.users : [defaultUserName()];
    state.activeUser = state.users.includes(state.activeUser) ? state.activeUser : state.users[0];
    state.theme = ['dark', 'light', 'brasil'].includes(state.theme) ? state.theme : 'dark';
    state.resultsFilter = resultPhases.some(phase => phase.value === state.resultsFilter) ? state.resultsFilter : 'all';
    state.thirds = state.thirds || [];
    state.history = state.history || [];
    state.future = state.future || [];
    state.users.forEach(user => {
      state.predictions[user] = state.predictions[user] || {};
      state.knockoutPredictions[user] = state.knockoutPredictions[user] || {};
    });
  }

  function restoreInto(state, savedState, resultPhases) {
    state.scores = savedState.scores || {};
    state.knockoutScores = savedState.knockoutScores || {};
    state.predictions = savedState.predictions || {};
    state.knockoutPredictions = savedState.knockoutPredictions || {};
    state.users = savedState.users || [defaultUserName()];
    state.activeUser = savedState.activeUser || state.users[0];
    state.theme = savedState.theme || 'dark';
    state.resultsFilter = savedState.resultsFilter || 'all';
    state.thirds = savedState.thirds || [];
    state.history = savedState.history || [];
    state.future = savedState.future || [];
    normalize(state, resultPhases);
  }

  function reset(state) {
    state.scores = {};
    state.knockoutScores = {};
    state.predictions = {};
    state.knockoutPredictions = {};
    state.users = [defaultUserName()];
    state.activeUser = defaultUserName();
    state.resultsFilter = 'all';
    state.thirds = [];
    state.history = [];
    state.future = [];
  }

  function pushHistory(state, onSave) {
    state.history = state.history || [];
    state.history.push(clone({
      scores: state.scores,
      knockoutScores: state.knockoutScores,
      predictions: state.predictions,
      knockoutPredictions: state.knockoutPredictions,
      users: state.users,
      activeUser: state.activeUser,
      theme: state.theme,
      resultsFilter: state.resultsFilter,
      thirds: state.thirds
    }));
    if(state.history.length > 50) state.history.shift();
    state.future = [];
    if(onSave) onSave();
  }

  window.AppState = {
    createInitialState,
    clone,
    normalize,
    restoreInto,
    reset,
    pushHistory
  };
})();
