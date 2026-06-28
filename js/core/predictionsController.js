(function () {
  function create(deps) {
    let groupPredictionFilter = 'all';
    let editingUser = false;

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

    function preserveViewport(callback, selector) {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      callback();
      restoreViewport(scrollX, scrollY, selector);
    }

    function userPredictionTotal(user) {
      return deps.predictionScoreService.groupTotal(user, deps.state);
    }

    function userKnockoutPredictionTotal(user) {
      return deps.predictionScoreService.knockoutTotal(user, deps.state);
    }

    function userPredictionExactCount(user) {
      return deps.predictionScoreService.groupExactCount(user, deps.state);
    }

    function userKnockoutPredictionExactCount(user) {
      return deps.predictionScoreService.knockoutExactCount(user, deps.state);
    }

    function predictionLocked(result, dateLabel) {
      return deps.predictionLockService.predictionLocked(result, dateLabel);
    }

    function lockedPredictionLabel(result, dateLabel) {
      return deps.predictionLockService.lockedLabel(result, dateLabel);
    }

    function knockoutPredictionLocked(result, dateLabel) {
      return deps.knockoutScoreComplete(result) || deps.predictionLockService.lockedByTime(dateLabel);
    }

    function lockedKnockoutPredictionLabel(result, dateLabel) {
      if(deps.knockoutScoreComplete(result)) return 'Palpite bloqueado: resultado lan\u00e7ado';
      if(deps.predictionLockService.lockedByTime(dateLabel)) return 'Palpite bloqueado: prazo encerrado';
      return '';
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
        exactForUser: userPredictionExactCount,
        editingUser,
        filter: groupPredictionFilter,
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
        predictionComplete,
        predictionStateClass: deps.predictionStateClass,
        winnerClass: deps.winnerClass
      });
      document.getElementById('userSelect').addEventListener('change', onUserSelect);
      document.getElementById('addUserBtn').addEventListener('click', onAddUser);
      document.querySelector('[data-user-action="group-edit"]').addEventListener('click', onEditUser);
      document.querySelector('[data-user-action="group-delete"]').addEventListener('click', onDeleteUser);
      document.getElementById('predictionFilter').addEventListener('change', onGroupPredictionFilterChange);
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
        exactForUser: userKnockoutPredictionExactCount,
        editingUser,
        phases: deps.knockoutPhases,
        knockoutMatches: deps.knockoutMatches,
        knockoutScores: deps.state.knockoutScores,
        getFlagUrl: deps.getFlagUrl,
        escapeHtml: deps.escapeHtml,
        predictionPoints: deps.predictionPoints,
        feedbackText: deps.feedbackText,
        predictionLocked: knockoutPredictionLocked,
        lockedPredictionLabel: lockedKnockoutPredictionLabel,
        predictionStateClass: deps.predictionStateClass,
        winnerClass: deps.winnerClass,
        knockoutWinnerClass: deps.knockoutWinnerClass,
        resolveSpec: spec => resolvePredictionSpec(spec, userPredictions),
        placeholderForSpec: deps.placeholderForSpec
      });
      document.getElementById('koUserSelect').addEventListener('change', onUserSelect);
      document.getElementById('koAddUserBtn').addEventListener('click', onAddKnockoutUser);
      document.querySelector('[data-user-action="knockout-edit"]').addEventListener('click', onEditUser);
      document.querySelector('[data-user-action="knockout-delete"]').addEventListener('click', onDeleteUser);
      document.querySelectorAll('input[data-ko-pred]').forEach(input => {
        input.addEventListener('input', onKnockoutPredictionInput);
      });
      document.querySelectorAll('[data-ko-pred-et], [data-ko-pred-pen]').forEach(input => {
        input.addEventListener('input', onKnockoutTiebreakInput);
      });
    }

    function predictionComplete(prediction) {
      return prediction && prediction.a !== '' && prediction.b !== '';
    }

    function predictedKnockoutTeam(matchId, type, predictions) {
      const match = deps.knockoutMatches.find(item => item.id === matchId);
      const prediction = predictions[matchId];
      if(!match || !deps.knockoutScoreComplete(prediction)) return null;
      const teamA = resolvePredictionSpec(match.a, predictions);
      const teamB = resolvePredictionSpec(match.b, predictions);
      const winnerSide = deps.knockoutWinnerSide(prediction);
      if(!winnerSide) return null;
      return winnerSide === 'a'
        ? (type === 'winner' ? teamA : teamB)
        : (type === 'winner' ? teamB : teamA);
    }

    function resolvePredictionSpec(spec, predictions) {
      if(spec.type === 'winner') {
        return predictedKnockoutTeam(spec.match, 'winner', predictions) || deps.placeholderForSpec(spec);
      }
      if(spec.type === 'loser') {
        return predictedKnockoutTeam(spec.match, 'loser', predictions) || deps.placeholderForSpec(spec);
      }
      return deps.resolveSpec(spec);
    }

    function onGroupPredictionFilterChange(event) {
      groupPredictionFilter = event.target.value;
      buildGroups();
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
      if(editingUser) {
        renameActiveUser(name);
        return;
      }
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

    function onEditUser(event) {
      editingUser = true;
      deps.render();
      const inputId = event.currentTarget.dataset.userAction.startsWith('knockout') ? 'koNewUserName' : 'newUserName';
      const input = document.getElementById(inputId);
      if(input) {
        input.focus();
        input.select();
      }
    }

    function renameActiveUser(normalizedName) {
      const currentName = deps.state.activeUser;
      if(!normalizedName || normalizedName === currentName || deps.state.users.includes(normalizedName)) return;
      const index = deps.state.users.indexOf(currentName);
      if(index < 0) return;
      deps.state.users[index] = normalizedName;
      deps.state.predictions[normalizedName] = deps.state.predictions[currentName] || {};
      deps.state.knockoutPredictions[normalizedName] = deps.state.knockoutPredictions[currentName] || {};
      delete deps.state.predictions[currentName];
      delete deps.state.knockoutPredictions[currentName];
      deps.state.activeUser = normalizedName;
      editingUser = false;
      deps.normalizeState();
      deps.save();
      deps.render();
    }

    function onDeleteUser() {
      const currentName = deps.state.activeUser;
      if(deps.state.users.length <= 1) return;
      deps.state.users = deps.state.users.filter(user => user !== currentName);
      delete deps.state.predictions[currentName];
      delete deps.state.knockoutPredictions[currentName];
      deps.state.activeUser = deps.state.users[0];
      editingUser = false;
      deps.normalizeState();
      deps.save();
      deps.render();
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
      if(pointsEl) pointsEl.textContent = deps.feedbackText(deps.state.scores[matchKey], points, deps.state.predictions[user][matchKey]);
      const scoreEl = document.getElementById('activePredictionScore');
      if(scoreEl) scoreEl.textContent = `${userPredictionTotal(user)} pts`;
    }

    function onKnockoutPredictionInput(event) {
      const [matchKey, side] = event.target.dataset.koPred.split('-');
      const user = deps.state.activeUser;
      deps.state.knockoutPredictions[user] = deps.state.knockoutPredictions[user] || {};
      deps.state.knockoutPredictions[user][matchKey] = deps.state.knockoutPredictions[user][matchKey] || {a:'', b:''};
      deps.state.knockoutPredictions[user][matchKey][side] = event.target.value;
      if(side === 'a' || side === 'b') {
        const prediction = deps.state.knockoutPredictions[user][matchKey];
        if(prediction.a !== prediction.b) {
          prediction.eta = '';
          prediction.etb = '';
          prediction.pena = '';
          prediction.penb = '';
        }
      }
      deps.save();
      preserveViewport(buildKnockout, `[data-ko-pred="${event.target.dataset.koPred}"]`);
    }

    function onKnockoutTiebreakInput(event) {
      const dataset = event.target.dataset;
      const raw = dataset.koPredTie || dataset.koPredEt || dataset.koPredPen;
      const [matchKey, field] = raw.split('-');
      const user = deps.state.activeUser;
      deps.state.knockoutPredictions[user] = deps.state.knockoutPredictions[user] || {};
      deps.state.knockoutPredictions[user][matchKey] = deps.state.knockoutPredictions[user][matchKey] || {a:'', b:''};
      deps.state.knockoutPredictions[user][matchKey][field] = event.target.value;
      const prediction = deps.state.knockoutPredictions[user][matchKey];
      if(field === 'eta' || field === 'etb') {
        if(prediction.eta === '' || prediction.etb === '' || Number(prediction.eta) !== Number(prediction.etb)) {
          prediction.pena = '';
          prediction.penb = '';
        }
      }
      deps.save();
      preserveViewport(buildKnockout, `[data-ko-pred-${dataset.koPredEt ? 'et' : 'pen'}="${raw}"]`);
    }

    return {
      buildGroups,
      buildKnockout,
      userPredictionTotal,
      userKnockoutPredictionTotal,
      userPredictionExactCount,
      userKnockoutPredictionExactCount
    };
  }

  window.PredictionsController = {
    create
  };
})();
