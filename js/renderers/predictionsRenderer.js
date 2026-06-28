(function () {
  function userOptions(users, activeUser, escapeHtml) {
    return users.map((user, index) => {
      return `<option value="${index}" ${user === activeUser ? 'selected' : ''}>${escapeHtml(user)}</option>`;
    }).join('');
  }

  function iconButton(type, target, label, disabled = false) {
    const icons = {
      edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
      delete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>'
    };
    return `<button class="icon-btn" type="button" data-user-action="${target}-${type}" title="${label}" aria-label="${label}" ${disabled ? 'disabled' : ''}>${icons[type]}</button>`;
  }

  function leaderboard(users, totalForUser, exactForUser, escapeHtml, title) {
    return `<div class="group-section">
      <div class="group-header">
        <div class="group-title">${title}</div>
      </div>
      <div class="leaderboard-row header">
        <div>#</div>
        <div>Usu&aacute;rio</div>
        <div>Exatos</div>
        <div>Pts</div>
      </div>
      ${users
        .map(user => ({user, points:totalForUser(user), exact:exactForUser(user)}))
        .sort((a,b) => b.points-a.points || a.user.localeCompare(b.user))
        .map((row, index) => `
          <div class="leaderboard-row ${index < 3 ? `top-${index+1}` : ''}">
            <div class="leaderboard-medal">${['1o','2o','3o'][index] || index+1}</div>
            <div class="standings-team">${escapeHtml(row.user)}</div>
            <div class="standings-stat">${row.exact}</div>
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
            <div class="prediction-points" data-pred-points="${key}">${deps.feedbackText(result, points, pred)}</div>
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
    const isPredictionLocked = deps.predictionLocked(result, match.label);
    const lockedLabel = deps.lockedPredictionLabel(result, match.label);
    const teamA = deps.resolveSpec(match.a);
    const teamB = deps.resolveSpec(match.b);
    const isAPlaceholder = teamA === deps.placeholderForSpec(match.a);
    const isBPlaceholder = teamB === deps.placeholderForSpec(match.b);
    const isDrawPrediction = pred.a !== '' && pred.b !== '' && Number(pred.a) === Number(pred.b);
    const tiebreakHtml = isDrawPrediction ? renderPredictionTiebreak(match.id, pred, isPredictionLocked) : '';
    return `
      <div class="match-card ${deps.predictionStateClass(points)}">
        <div class="team-slot${deps.knockoutWinnerClass(result, 'a')}">
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
          ${tiebreakHtml}
          <div class="prediction-points" data-ko-pred-points="${match.id}">${deps.feedbackText(result, points, pred)}</div>
          ${lockedLabel ? `<div class="lock-note">${lockedLabel}</div>` : ''}
        </div>
        <div class="team-slot${deps.knockoutWinnerClass(result, 'b')}" style="flex-direction:row-reverse;text-align:right">
          ${isBPlaceholder ? '<div class="flag"></div>' : `<div class="flag" style="background-image:url('${deps.getFlagUrl(teamB)}')"></div>`}
          <div class="team-info" style="align-items:flex-end">
            <div class="team-name">${teamB}</div>
            <div class="team-code">J${match.id}</div>
          </div>
        </div>
      </div>`;
  }

  function renderPredictionTiebreak(matchId, prediction, isLocked) {
    const disabled = isLocked ? 'disabled' : '';
    const showPenalties = prediction.eta !== '' && prediction.etb !== '' && Number(prediction.eta) === Number(prediction.etb);
    return `<div class="tiebreak-box">
      <div class="tiebreak-line">
        <span>Pror.</span>
        <input class="score-input tiny" type="number" min="0" max="99" data-ko-pred-et="${matchId}-eta" value="${prediction.eta || ''}" placeholder="0" ${disabled}>
        <div class="score-sep">:</div>
        <input class="score-input tiny" type="number" min="0" max="99" data-ko-pred-et="${matchId}-etb" value="${prediction.etb || ''}" placeholder="0" ${disabled}>
      </div>
      ${showPenalties ? `
        <div class="tiebreak-line">
          <span>Pen.</span>
          <input class="score-input tiny" type="number" min="0" max="99" data-ko-pred-pen="${matchId}-pena" value="${prediction.pena || ''}" placeholder="0" ${disabled}>
          <div class="score-sep">:</div>
          <input class="score-input tiny" type="number" min="0" max="99" data-ko-pred-pen="${matchId}-penb" value="${prediction.penb || ''}" placeholder="0" ${disabled}>
        </div>` : ''}
    </div>`;
  }

  function renderGroups(container, deps) {
    const options = userOptions(deps.users, deps.activeUser, deps.escapeHtml);
    let html = `<div class="prediction-toolbar">
      <select id="userSelect">${options}</select>
      <div class="user-actions">
        ${iconButton('edit', 'group', 'Editar usu&aacute;rio')}
        ${iconButton('delete', 'group', 'Remover usu&aacute;rio', deps.users.length <= 1)}
      </div>
      <input id="newUserName" type="text" maxlength="30" placeholder="Nome do usu&aacute;rio" value="${deps.editingUser ? deps.escapeHtml(deps.activeUser) : ''}">
      <button id="addUserBtn" class="secondary">${deps.editingUser ? 'Salvar' : 'Adicionar'}</button>
      <select id="predictionFilter">
        <option value="all" ${deps.filter === 'all' ? 'selected' : ''}>Todos os jogos</option>
        <option value="predicted" ${deps.filter === 'predicted' ? 'selected' : ''}>Jogos que palpitei</option>
        <option value="available" ${deps.filter === 'available' ? 'selected' : ''}>Dispon&iacute;veis para palpite</option>
      </select>
      <div class="prediction-score" id="activePredictionScore">${deps.total} pts</div>
    </div>`;

    html += leaderboard(deps.users, deps.totalForUser, deps.exactForUser, deps.escapeHtml, 'Ranking de palpites');

    deps.groups.forEach(group => {
      const groupMatches = deps.matches[group].map((match, index) => ({match, index})).filter(item => {
        const key = `${group}${item.index+1}`;
        const pred = deps.userPredictions[key] || {a:'', b:''};
        const result = deps.scores[key];
        if(deps.filter === 'predicted') return deps.predictionComplete(pred);
        if(deps.filter === 'available') return !deps.predictionComplete(pred) && !deps.predictionLocked(result, deps.matchDates[group][item.index]);
        return true;
      });
      if(!groupMatches.length) return;
      html += `<div class="group-section">
        <div class="group-header">
          <div class="group-title">Palpites - Grupo ${group}</div>
        </div>`;
      groupMatches.forEach(item => {
        html += groupMatch(group, item.index, item.match, deps);
      });
      html += '</div>';
    });

    container.innerHTML = html;
  }

  function renderKnockout(container, deps) {
    const options = userOptions(deps.users, deps.activeUser, deps.escapeHtml);
    let html = `<div class="prediction-toolbar">
      <select id="koUserSelect">${options}</select>
      <div class="user-actions">
        ${iconButton('edit', 'knockout', 'Editar usu&aacute;rio')}
        ${iconButton('delete', 'knockout', 'Remover usu&aacute;rio', deps.users.length <= 1)}
      </div>
      <input id="koNewUserName" type="text" maxlength="30" placeholder="Nome do usu&aacute;rio" value="${deps.editingUser ? deps.escapeHtml(deps.activeUser) : ''}">
      <button id="koAddUserBtn" class="secondary">${deps.editingUser ? 'Salvar' : 'Adicionar'}</button>
      <div class="prediction-score" id="activeKoPredictionScore">${deps.total} pts</div>
    </div>`;

    html += leaderboard(deps.users, deps.totalForUser, deps.exactForUser, deps.escapeHtml, 'Ranking de palpites - Mata-Mata');

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
