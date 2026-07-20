  const {
    TEAMS,
    COUNTRY_CODES,
    GROUPS,
    matches,
    matchDates,
    RESULT_PHASES,
    KNOCKOUT_MATCHES,
    KNOCKOUT_PHASES
  } = window.WorldCupData;
  const {
    THIRD_PLACE_HOSTS,
    THIRD_PLACE_COMBINATIONS
  } = window.WorldCupThirdPlaceCombinations;
  const { predictionPoints, feedbackText } = window.PredictionService;
  const {
    getTeamName,
    getFlagUrl,
    escapeHtml,
    scoreComplete,
    matchStateClass,
    predictionStateClass,
    winnerClass
  } = window.UiHelpers.create({
    teams: TEAMS,
    countryCodes: COUNTRY_CODES
  });
  const standingsService = window.StandingsService.create({
    teams: TEAMS,
    matches,
    groups: GROUPS,
    scoreComplete
  });
  const knockoutService = window.KnockoutService.create({
    matches: KNOCKOUT_MATCHES,
    standingsService,
    scoreComplete,
    thirdPlaceHosts: THIRD_PLACE_HOSTS,
    thirdPlaceCombinations: THIRD_PLACE_COMBINATIONS
  });
  const predictionLockService = window.PredictionService.createLockService({
    scoreComplete,
    lockMinutes: 10,
    defaultKickoffHour: 12,
    year: 2026
  });
  const predictionScoreService = window.PredictionService.createScoreService({
    groups: GROUPS,
    matches,
    knockoutMatches: KNOCKOUT_MATCHES
  });
  const storageConfig = {
    provider: 'firebase',
    key: 'copa2026-novo',
    collection: 'copa2026Storage',
    documentId: 'shared-state',
    firebaseConfig: {
      apiKey: 'AIzaSyBE93ToVbVuaJzE762MTjlXnf8SBdDQD1w',
      authDomain: 'my-first-project-ce430.firebaseapp.com',
      projectId: 'my-first-project-ce430',
      storageBucket: 'my-first-project-ce430.firebasestorage.app',
      messagingSenderId: '995700253305',
      appId: '1:995700253305:web:fe4765d85d7de0a253eaa8',
      measurementId: 'G-VCKTXW5MML'
    }
  };
  const storage = window.StorageService.create(storageConfig);

  const state = window.AppState.createInitialState();
  let syncSequence = 0;

  function setSyncStatus(status, label) {
    const element = document.getElementById('syncStatus');
    if(!element) return;
    element.textContent = label;
    element.className = `sync-status is-${status}`;
  }

  function save(options = {}){
    state.updatedAt = Date.now();
    const sequence = ++syncSequence;
    setSyncStatus('saving', 'Sincronizando...');
    const result = storage.save(state, options);
    if(result && typeof result.then === 'function') {
      result
        .then(response => {
          if(sequence === syncSequence) setSyncStatus('saved', response && response.fallback ? 'Salvo local' : 'Salvo');
        })
        .catch(error => {
          console.error(error);
          if(sequence === syncSequence) setSyncStatus('error', 'Erro ao salvar');
        });
    } else {
      setSyncStatus('saved', 'Salvo');
    }
    return result;
  }
  function applyTheme(){
    state.theme = ['dark', 'light', 'brasil', 'campeao'].includes(state.theme) ? state.theme : 'dark';
    document.body.dataset.theme = state.theme;
    document.querySelectorAll('[data-theme-option]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeOption === state.theme);
    });
  }
  function pushHistory(){
    window.AppState.pushHistory(state, save);
  }
  function normalizeState(){
    window.AppState.normalize(state, RESULT_PHASES);
  }
  function restore(s, shouldSave = true){
    window.AppState.restoreInto(state, s, RESULT_PHASES);
    render();
    if(shouldSave) save();
  }

  async function syncNow(){
    setSyncStatus('loading', 'Carregando...');
    try{
      const saved = await storage.load();
      if(saved && typeof saved === 'object') {
        window.AppState.restoreInto(state, saved, RESULT_PHASES);
        render();
      }
      setSyncStatus('saved', 'Salvo');
    }catch(error){
      console.error(error);
      setSyncStatus('error', 'Erro ao sincronizar');
    }
  }

  function resetState(){
    window.AppState.reset(state);
  }

  function placeholderForSpec(spec){
    return knockoutService.placeholderForSpec(spec);
  }

  function resolveSpec(spec){
    return knockoutService.resolveSpec(spec, state.scores, state.knockoutScores);
  }

  function knockoutScoreComplete(score){
    return knockoutService.knockoutScoreComplete(score);
  }

  function knockoutWinnerClass(score, side){
    return knockoutService.knockoutWinnerClass(score, side);
  }

  const scoresController = window.ScoresController.create({
    state,
    groups: GROUPS,
    matches,
    matchDates,
    resultPhases: RESULT_PHASES,
    knockoutMatches: KNOCKOUT_MATCHES,
    knockoutPhases: KNOCKOUT_PHASES,
    save,
    pushHistory,
    render,
    getTeamName,
    getFlagUrl,
    scoreComplete,
    knockoutScoreComplete,
    matchStateClass,
    winnerClass,
    knockoutWinnerClass,
    resolveSpec,
    placeholderForSpec
  });

  const predictionsController = window.PredictionsController.create({
    state,
    groups: GROUPS,
    matches,
    matchDates,
    knockoutMatches: KNOCKOUT_MATCHES,
    knockoutPhases: KNOCKOUT_PHASES,
    predictionScoreService,
    predictionLockService,
    save,
    render,
    normalizeState,
    getTeamName,
    getFlagUrl,
    escapeHtml,
    predictionPoints,
    feedbackText,
    predictionStateClass,
    winnerClass,
    knockoutWinnerClass,
    knockoutScoreComplete,
    knockoutWinnerSide: knockoutService.winnerFromScore,
    resolveSpec,
    placeholderForSpec
  });

  let statisticsController;
  const overviewController = window.OverviewController.create({
    state,
    groups: GROUPS,
    matches,
    matchDates,
    knockoutMatches: KNOCKOUT_MATCHES,
    standingsService,
    getTeamName,
    getFlagUrl,
    escapeHtml,
    scoreComplete,
    userPredictionTotal: predictionsController.userPredictionTotal,
    userPredictionExactCount: predictionsController.userPredictionExactCount,
    userKnockoutPredictionTotal: predictionsController.userKnockoutPredictionTotal,
    userKnockoutPredictionExactCount: predictionsController.userKnockoutPredictionExactCount,
    resolveSpec,
    tournamentStats: () => statisticsController ? statisticsController.heroPayload() : null
  });

  statisticsController = window.StatisticsController.create({
    state,
    teams: TEAMS,
    countryCodes: COUNTRY_CODES,
    groups: GROUPS,
    matches,
    matchDates,
    knockoutMatches: KNOCKOUT_MATCHES,
    getTeamName,
    getFlagUrl,
    escapeHtml,
    scoreComplete,
    knockoutScoreComplete,
    resolveSpec,
    save,
    render
  });

  function buildJogos(){
    scoresController.buildJogos();
  }

  function buildHeroStats(){
    overviewController.buildHeroStats();
  }

  function buildTabela(){
    overviewController.buildTabela();
  }

  function buildMataMata(){
    scoresController.buildMataMata();
  }

  function buildResultados(){
    scoresController.buildResultados();
  }

  function buildPalpites(){
    predictionsController.buildGroups();
  }

  function buildPalpitesMataMata(){
    predictionsController.buildKnockout();
  }

  function buildPalpitesRanking(){
    predictionsController.buildOverallRanking();
  }

  function buildEstatisticas(){
    statisticsController.render();
  }

  function render(){
    normalizeState();
    applyTheme();
    buildHeroStats();
    buildJogos();
    buildTabela();
    buildResultados();
    buildPalpites();
    buildPalpitesMataMata();
    buildPalpitesRanking();
    buildMataMata();
    buildEstatisticas();
  }

  window.AppController.init({
    state,
    applyTheme,
    save,
    restore,
    resetState,
    render,
    syncNow,
    load: storage.load,
    onLoadError: error => {
      console.error(error);
      setSyncStatus('error', 'Erro ao carregar');
    }
  }).then(() => {
    statisticsController.refresh();
    window.setInterval(() => statisticsController.refresh(), 2 * 60 * 1000);
  });
