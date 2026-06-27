(function () {
  function create(deps) {
    const editingResultKeys = new Set();
    const editingKnockoutResultKeys = new Set();
    let selectedGroup = 'all';

    function restoreViewport(scrollX, scrollY, selector) {
      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
        const input = selector ? document.querySelector(selector) : null;
        if(input && !input.disabled) {
          input.focus({preventScroll:true});
          const len = input.value.length;
          input.setSelectionRange(len, len);
        }
        setTimeout(() => window.scrollTo(scrollX, scrollY), 0);
      });
    }

    function renderPreservingPosition(scoreKey, koScoreKey) {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      deps.render();
      const selector = scoreKey ? `[data-score="${scoreKey}"]` : `[data-ko-score="${koScoreKey}"]`;
      restoreViewport(scrollX, scrollY, selector);
    }

    function onResultEditToggle(event) {
      const key = event.currentTarget.dataset.resultEdit;
      if(editingResultKeys.has(key)) editingResultKeys.delete(key);
      else editingResultKeys.add(key);
      renderPreservingPosition(`${key}-a`);
    }

    function onScoreInput(event) {
      const [matchKey, side] = event.target.dataset.score.split('-');
      deps.state.scores[matchKey] = deps.state.scores[matchKey] || {a:'',b:''};
      deps.state.scores[matchKey][side] = event.target.value;
      deps.pushHistory();
      renderPreservingPosition(event.target.dataset.score);
    }

    function buildJogos() {
      window.MatchesRenderer.renderGroups(document.getElementById('jogosContent'), {
        groups: deps.groups,
        matches: deps.matches,
        matchDates: deps.matchDates,
        scores: deps.state.scores,
        editingResultKeys,
        selectedGroup,
        getTeamName: deps.getTeamName,
        getFlagUrl: deps.getFlagUrl,
        scoreComplete: deps.scoreComplete,
        matchStateClass: deps.matchStateClass,
        winnerClass: deps.winnerClass
      });
      document.getElementById('groupFilter').addEventListener('change', onGroupFilterChange);
      document.querySelectorAll('input[data-score]').forEach(input => input.addEventListener('input', onScoreInput));
      document.querySelectorAll('[data-result-edit]').forEach(btn => btn.addEventListener('click', onResultEditToggle));
    }

    function onGroupFilterChange(event) {
      selectedGroup = event.target.value;
      buildJogos();
    }

    function onKnockoutScoreInput(event) {
      const [matchKey, side] = event.target.dataset.koScore.split('-');
      deps.state.knockoutScores[matchKey] = deps.state.knockoutScores[matchKey] || {a:'', b:''};
      deps.state.knockoutScores[matchKey][side] = event.target.value;
      deps.save();
      renderPreservingPosition(null, event.target.dataset.koScore);
    }

    function onKnockoutResultEditToggle(event) {
      const key = event.currentTarget.dataset.koResultEdit;
      if(editingKnockoutResultKeys.has(key)) editingKnockoutResultKeys.delete(key);
      else editingKnockoutResultKeys.add(key);
      renderPreservingPosition(null, `${key}-a`);
    }

    function buildMataMata() {
      window.KnockoutRenderer.render(document.getElementById('mataMatoContent'), {
        phases: deps.knockoutPhases,
        knockoutMatches: deps.knockoutMatches,
        knockoutScores: deps.state.knockoutScores,
        editingKnockoutResultKeys,
        getFlagUrl: deps.getFlagUrl,
        scoreComplete: deps.scoreComplete,
        matchStateClass: deps.matchStateClass,
        winnerClass: deps.winnerClass,
        resolveSpec: deps.resolveSpec,
        placeholderForSpec: deps.placeholderForSpec
      });
      document.querySelectorAll('input[data-ko-score]').forEach(input => input.addEventListener('input', onKnockoutScoreInput));
      document.querySelectorAll('[data-ko-result-edit]').forEach(btn => btn.addEventListener('click', onKnockoutResultEditToggle));
    }

    function buildResultados() {
      window.ResultsRenderer.render(document.getElementById('resultadosContent'), {
        selectedPhase: deps.state.resultsFilter,
        phases: deps.resultPhases,
        groups: deps.groups,
        matches: deps.matches,
        matchDates: deps.matchDates,
        groupScores: deps.state.scores,
        knockoutScores: deps.state.knockoutScores,
        knockoutMatches: deps.knockoutMatches,
        getTeamName: deps.getTeamName,
        getFlagUrl: deps.getFlagUrl,
        scoreComplete: deps.scoreComplete,
        matchStateClass: deps.matchStateClass,
        winnerClass: deps.winnerClass,
        resolveSpec: deps.resolveSpec,
        placeholderForSpec: deps.placeholderForSpec
      });
      document.getElementById('resultsFilter').addEventListener('change', onResultsFilterChange);
    }

    function onResultsFilterChange(event) {
      deps.state.resultsFilter = event.target.value;
      deps.save();
      buildResultados();
    }

    return {
      buildJogos,
      buildMataMata,
      buildResultados
    };
  }

  window.ScoresController = {
    create
  };
})();
