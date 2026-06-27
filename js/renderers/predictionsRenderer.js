(function () {
  function userOptions(users, activeUser, escapeHtml) {
    return users.map((user, index) => {
      return `<option value="${index}" ${user === activeUser ? 'selected' : ''}>${escapeHtml(user)}</option>`;
    }).join('');
  }

  function leaderboard(users, totalForUser, escapeHtml, title) {
    return `<div class="group-section">
      <div class="group-header">
        <div class="group-title">${title}</div>
      </div>
      <div class="leaderboard-row header">
        <div>#</div>
        <div>Usu&aacute;rio</div>
        <div>Pts</div>
      </div>
      ${users
        .map(user => ({user, points:totalForUser(user)}))
        .sort((a,b) => b.points-a.points || a.user.localeCompare(b.user))
        .map((row, index) => `
          <div class="leaderboard-row ${index < 3 ? `top-${index+1}` : ''}">
            <div class="leaderboard-medal">${['1o','2o','3o'][index] || index+1}</div>
            <div class="standings-team">${escapeHtml(row.user)}</div>
            <div class="standings-pts">${row.points}</div>
          </div>`)
        .join('')}
    </div>`;
  }

  function groupMatch(group, index, match, deps) {
    const key = `${group}${index+1}`;
    const pred = deps.userPredictions[key] || {a:'', b:''};
    const result = deps.scores[key];
    const points = deps.predictionPoints(pred, result);
    const team1 = deps.getTeamName(match[0]);
    const team2 = deps.getTeamName(match[1]);
    const date = deps.matchDates[group][index];
    const isPredictionLocked = deps.predictionLocked(result, date);
    const lockedLabel = deps.lockedPredictionLabel(result, date);
    return `
        <div class="match-card ${deps.predictionStateClass(points)}">
          <div class="team-slot${deps.winnerClass(result, 'a')}">
            <div class="flag" style="background-image:url('${deps.getFlagUrl(team1)}')"></div>
            <div class="team-info">
              <div class="team-name">${team1}</div>
              <div class="team-code">${match[0]}</div>
            </div>
          </div>
          <div class="score-box">
            <div class="match-date">${date}</div>
            <div class="score-line">
              <input class="score-input" type="number" min="0" max="99" data-pred="${key}-a" value="${pred.a === '' ? '' : pred.a}" placeholder="0" ${isPredictionLocked ? 'disabled' : ''}>
              <div class="score-sep">:</div>
              <input class="score-input" type="number" min="0" max="99" data-pred="${key}-b" value="${pred.b === '' ? '' : pred.b}" placeholder="0" ${isPredictionLocked ? 'disabled' : ''}>
            </div>
            <div class="prediction-points" data-pred-points="${key}">${deps.feedbackText(result, points)}</div>
            ${lockedLabel ? `<div class="lock-note">${lockedLabel}</div>` : ''}
          </div>
          <div class="team-slot${deps.winnerClass(result, 'b')}" style="flex-direction:row-reverse;text-align:right">
            <div class="flag" style="background-image:url('${deps.getFlagUrl(team2)}')"></div>
            <div class="team-info" style="align-items:flex-end">
              <div class="team-name">${team2}</div>
              <div class="team-code">${match[1]}</div>
            </div>
          </div>
        </div>`;
  }

  function knockoutMatch(match, deps) {
    const pred = deps.userPredictions[match.id] || {a:'', b:''};
    const result = deps.knockoutScores[match.id];
    const points = deps.predictionPoints(pred, result);
    const isPredictionLocked = deps.predictionLocked(result, null);
    const lockedLabel = deps.lockedPredictionLabel(result, null);
    const teamA = deps.resolveSpec(match.a);
    const teamB = deps.resolveSpec(match.b);
    const isAPlaceholder = teamA === deps.placeholderForSpec(match.a);
    const isBPlaceholder = teamB === deps.placeholderForSpec(match.b);
    return `
      <div class="match-card ${deps.predictionStateClass(points)}">
        <div class="team-slot${deps.winnerClass(result, 'a')}">
          ${isAPlaceholder ? '<div class="flag"></div>' : `<div class="flag" style="background-image:url('${deps.getFlagUrl(teamA)}')"></div>`}
          <div class="team-info">
            <div class="team-name">${teamA}</div>
            <div class="team-code">J${match.id}</div>
          </div>
        </div>
        <div class="score-box">
          <div class="match-date">${match.label}</div>
          <div class="score-line">
            <input class="score-input" type="number" min="0" max="99" data-ko-pred="${match.id}-a" value="${pred.a === '' ? '' : pred.a}" placeholder="0" ${isPredictionLocked ? 'disabled' : ''}>
            <div class="score-sep">:</div>
            <input class="score-input" type="number" min="0" max="99" data-ko-pred="${match.id}-b" value="${pred.b === '' ? '' : pred.b}" placeholder="0" ${isPredictionLocked ? 'disabled' : ''}>
          </div>
          <div class="prediction-points" data-ko-pred-points="${match.id}">${deps.feedbackText(result, points)}</div>
          ${lockedLabel ? `<div class="lock-note">${lockedLabel}</div>` : ''}
        </div>
        <div class="team-slot${deps.winnerClass(result, 'b')}" style="flex-direction:row-reverse;text-align:right">
          ${isBPlaceholder ? '<div class="flag"></div>' : `<div class="flag" style="background-image:url('${deps.getFlagUrl(teamB)}')"></div>`}
          <div class="team-info" style="align-items:flex-end">
            <div class="team-name">${teamB}</div>
            <div class="team-code">J${match.id}</div>
          </div>
        </div>
      </div>`;
  }

  function renderGroups(container, deps) {
    const options = userOptions(deps.users, deps.activeUser, deps.escapeHtml);
    let html = `<div class="prediction-toolbar">
      <select id="userSelect">${options}</select>
      <input id="newUserName" type="text" maxlength="30" placeholder="Nome do usu&aacute;rio">
      <button id="addUserBtn" class="secondary">Adicionar</button>
      <div class="prediction-score" id="activePredictionScore">${deps.total} pts</div>
    </div>`;

    html += leaderboard(deps.users, deps.totalForUser, deps.escapeHtml, 'Ranking de palpites');

    deps.groups.forEach(group => {
      html += `<div class="group-section">
        <div class="group-header">
          <div class="group-title">Palpites - Grupo ${group}</div>
        </div>`;
      deps.matches[group].forEach((match, index) => {
        html += groupMatch(group, index, match, deps);
      });
      html += '</div>';
    });

    container.innerHTML = html;
  }

  function renderKnockout(container, deps) {
    const options = userOptions(deps.users, deps.activeUser, deps.escapeHtml);
    let html = `<div class="prediction-toolbar">
      <select id="koUserSelect">${options}</select>
      <input id="koNewUserName" type="text" maxlength="30" placeholder="Nome do usu&aacute;rio">
      <button id="koAddUserBtn" class="secondary">Adicionar</button>
      <div class="prediction-score" id="activeKoPredictionScore">${deps.total} pts</div>
    </div>`;

    html += leaderboard(deps.users, deps.totalForUser, deps.escapeHtml, 'Ranking de palpites - Mata-Mata');

    deps.phases.forEach(phase => {
      html += `<div class="group-section">
        <div class="group-header">
          <div class="group-title">Palpites - ${phase.label}</div>
        </div>`;
      deps.knockoutMatches.filter(match => match.phase === phase.value).forEach(match => {
        html += knockoutMatch(match, deps);
      });
      html += '</div>';
    });

    container.innerHTML = html;
  }

  window.PredictionsRenderer = {
    renderGroups,
    renderKnockout
  };
})();
