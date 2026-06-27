(function () {
  function create(deps) {
    function userPredictionTotal(user) {
      return deps.predictionScoreService.groupTotal(user, deps.state);
    }

    function userKnockoutPredictionTotal(user) {
      return deps.predictionScoreService.knockoutTotal(user, deps.state);
    }

    function predictionLocked(result, dateLabel) {
      return deps.predictionLockService.predictionLocked(result, dateLabel);
    }

    function lockedPredictionLabel(result, dateLabel) {
      return deps.predictionLockService.lockedLabel(result, dateLabel);
    }

    function buildGroups() {
      deps.normalizeState();
      const activeUser = deps.state.activeUser;
      const userPredictions = deps.state.predictions[activeUser] || {};
      window.PredictionsRenderer.renderGroups(document.getElementById('palpitesContent'), {
        users: deps.state.users,
        activeUser,
        userPredictions,
        total: userPredictionTotal(activeUser),
        totalForUser: userPredictionTotal,
        groups: deps.groups,
        matches: deps.matches,
        matchDates: deps.matchDates,
        scores: deps.state.scores,
        getTeamName: deps.getTeamName,
        getFlagUrl: deps.getFlagUrl,
        escapeHtml: deps.escapeHtml,
        predictionPoints: deps.predictionPoints,
        feedbackText: deps.feedbackText,
        predictionLocked,
        lockedPredictionLabel,
        predictionStateClass: deps.predictionStateClass,
        winnerClass: deps.winnerClass
      });
      document.getElementById('userSelect').addEventListener('change', onUserSelect);
      document.getElementById('addUserBtn').addEventListener('click', onAddUser);
      document.querySelectorAll('input[data-pred]').forEach(input => {
        input.addEventListener('input', onPredictionInput);
      });
    }

    function buildKnockout() {
      deps.normalizeState();
      const activeUser = deps.state.activeUser;
      const userPredictions = deps.state.knockoutPredictions[activeUser] || {};
      window.PredictionsRenderer.renderKnockout(document.getElementById('palpitesMataMataContent'), {
        users: deps.state.users,
        activeUser,
        userPredictions,
        total: userKnockoutPredictionTotal(activeUser),
        totalForUser: userKnockoutPredictionTotal,
        phases: deps.knockoutPhases,
        knockoutMatches: deps.knockoutMatches,
        knockoutScores: deps.state.knockoutScores,
        getFlagUrl: deps.getFlagUrl,
        escapeHtml: deps.escapeHtml,
        predictionPoints: deps.predictionPoints,
        feedbackText: deps.feedbackText,
        predictionLocked,
        lockedPredictionLabel,
        predictionStateClass: deps.predictionStateClass,
        winnerClass: deps.winnerClass,
        resolveSpec: deps.resolveSpec,
        placeholderForSpec: deps.placeholderForSpec
      });
      document.getElementById('koUserSelect').addEventListener('change', onUserSelect);
      document.getElementById('koAddUserBtn').addEventListener('click', onAddKnockoutUser);
      document.querySelectorAll('input[data-ko-pred]').forEach(input => {
        input.addEventListener('input', onKnockoutPredictionInput);
      });
    }

    function onUserSelect(event) {
      deps.state.activeUser = deps.state.users[Number(event.target.value)] || deps.state.users[0];
      deps.normalizeState();
      deps.save();
      deps.render();
    }

    function addUserFromInput(inputId) {
      const input = document.getElementById(inputId);
      const name = input.value.trim();
      if(!name) return;
      if(!deps.state.users.includes(name)) deps.state.users.push(name);
      deps.state.activeUser = name;
      deps.normalizeState();
      deps.save();
      deps.render();
    }

    function onAddUser() {
      addUserFromInput('newUserName');
    }

    function onAddKnockoutUser() {
      addUserFromInput('koNewUserName');
    }

    function onPredictionInput(event) {
      const [matchKey, side] = event.target.dataset.pred.split('-');
      const user = deps.state.activeUser;
      deps.state.predictions[user] = deps.state.predictions[user] || {};
      deps.state.predictions[user][matchKey] = deps.state.predictions[user][matchKey] || {a:'', b:''};
      deps.state.predictions[user][matchKey][side] = event.target.value;
      deps.save();
      const points = deps.predictionPoints(deps.state.predictions[user][matchKey], deps.state.scores[matchKey]);
      const pointsEl = document.querySelector(`[data-pred-points="${matchKey}"]`);
      if(pointsEl) pointsEl.textContent = deps.feedbackText(deps.state.scores[matchKey], points);
      const scoreEl = document.getElementById('activePredictionScore');
      if(scoreEl) scoreEl.textContent = `${userPredictionTotal(user)} pts`;
    }

    function onKnockoutPredictionInput(event) {
      const [matchKey, side] = event.target.dataset.koPred.split('-');
      const user = deps.state.activeUser;
      deps.state.knockoutPredictions[user] = deps.state.knockoutPredictions[user] || {};
      deps.state.knockoutPredictions[user][matchKey] = deps.state.knockoutPredictions[user][matchKey] || {a:'', b:''};
      deps.state.knockoutPredictions[user][matchKey][side] = event.target.value;
      deps.save();
      const points = deps.predictionPoints(deps.state.knockoutPredictions[user][matchKey], deps.state.knockoutScores[matchKey]);
      const pointsEl = document.querySelector(`[data-ko-pred-points="${matchKey}"]`);
      if(pointsEl) pointsEl.textContent = deps.feedbackText(deps.state.knockoutScores[matchKey], points);
      const scoreEl = document.getElementById('activeKoPredictionScore');
      if(scoreEl) scoreEl.textContent = `${userKnockoutPredictionTotal(user)} pts`;
    }

    return {
      buildGroups,
      buildKnockout,
      userPredictionTotal,
      userKnockoutPredictionTotal
    };
  }

  window.PredictionsController = {
    create
  };
})();
