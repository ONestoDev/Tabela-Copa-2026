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
    scoreComplete
  });
  const predictionLockService = window.PredictionService.createLockService({
    scoreComplete,
    lockMinutes: 60,
    defaultKickoffHour: 12,
    year: 2026
  });
  const predictionScoreService = window.PredictionService.createScoreService({
    groups: GROUPS,
    matches,
    knockoutMatches: KNOCKOUT_MATCHES
  });
  const storageConfig = {
    provider: 'googleSheets',
    key: 'copa2026-novo',
    endpoint: 'https://script.google.com/macros/s/AKfycbxeM8O6Iu_8m1vyB7Fp0lltapvb2SPVeb3_a05S-NNp_TnXQC0CW2WCp2_vzV-mFQg/exec'
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

  function save(){
    const sequence = ++syncSequence;
    setSyncStatus('saving', 'Sincronizando...');
    const result = storage.save(state);
    if(result && typeof result.then === 'function') {
      result
        .then(() => {
          if(sequence === syncSequence) setSyncStatus('saved', 'Salvo');
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
    state.theme = ['dark', 'light', 'brasil'].includes(state.theme) ? state.theme : 'dark';
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
  function restore(s){
    window.AppState.restoreInto(state, s, RESULT_PHASES);
    render();
    save();
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
    matchStateClass,
    winnerClass,
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
    resolveSpec,
    placeholderForSpec
  });

  const overviewController = window.OverviewController.create({
    state,
    groups: GROUPS,
    matches,
    standingsService,
    getTeamName,
    getFlagUrl,
    escapeHtml,
    scoreComplete,
    userPredictionTotal: predictionsController.userPredictionTotal
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

  function render(){
    normalizeState();
    applyTheme();
    buildHeroStats();
    buildJogos();
    buildTabela();
    buildResultados();
    buildPalpites();
    buildPalpitesMataMata();
    buildMataMata();
    save();
  }

  window.AppController.init({
    state,
    applyTheme,
    save,
    restore,
    resetState,
    render,
    syncNow,
    load: storage.load
  });
