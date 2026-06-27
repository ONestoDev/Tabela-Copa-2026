(function () {
  function renderMatch(match, deps) {
    const score = deps.knockoutScores[match.id] || {a:'', b:''};
    const isComplete = knockoutScoreComplete(score);
    const isEditing = deps.editingKnockoutResultKeys.has(String(match.id));
    const isLocked = isComplete && !isEditing;
    const teamA = deps.resolveSpec(match.a);
    const teamB = deps.resolveSpec(match.b);
    const isAPlaceholder = teamA === deps.placeholderForSpec(match.a);
    const isBPlaceholder = teamB === deps.placeholderForSpec(match.b);
    const isDrawScore = score.a !== '' && score.b !== '' && Number(score.a) === Number(score.b);
    const tiebreakHtml = isDrawScore ? renderTiebreak(match.id, score, isLocked) : '';
    return `
      <div class="match-card ${deps.matchStateClass(score)}">
        <div class="team-slot${deps.winnerClass(score, 'a')}">
          ${isAPlaceholder ? '<div class="flag"></div>' : `<div class="flag" style="background-image:url('${deps.getFlagUrl(teamA)}')"></div>`}
          <div class="team-info">
            <div class="team-name">${teamA}</div>
            <div class="team-code">J${match.id}</div>
          </div>
        </div>
        <div class="score-box">
          <div class="match-date">${match.label}</div>
          <div class="score-line">
            <input class="score-input" type="number" min="0" max="99" data-ko-score="${match.id}-a" value="${score.a === '' ? '' : score.a}" placeholder="0" ${isLocked ? 'disabled' : ''}>
            <div class="score-sep">:</div>
            <input class="score-input" type="number" min="0" max="99" data-ko-score="${match.id}-b" value="${score.b === '' ? '' : score.b}" placeholder="0" ${isLocked ? 'disabled' : ''}>
          </div>
          ${tiebreakHtml}
          ${isComplete ? `<button class="mini-edit-btn" type="button" data-ko-result-edit="${match.id}">${isEditing ? 'OK' : 'Editar'}</button>` : ''}
        </div>
        <div class="team-slot${deps.winnerClass(score, 'b')}" style="flex-direction:row-reverse;text-align:right">
          ${isBPlaceholder ? '<div class="flag"></div>' : `<div class="flag" style="background-image:url('${deps.getFlagUrl(teamB)}')"></div>`}
          <div class="team-info" style="align-items:flex-end">
            <div class="team-name">${teamB}</div>
            <div class="team-code">J${match.id}</div>
          </div>
        </div>
      </div>`;
  }

  function knockoutScoreComplete(score) {
    if(!score || score.a === '' || score.b === '') return false;
    if(Number(score.a) !== Number(score.b)) return true;
    if(score.eta === '' || score.etb === '') return false;
    if(Number(score.eta) !== Number(score.etb)) return true;
    return score.pena !== '' && score.penb !== '' && Number(score.pena) !== Number(score.penb);
  }

  function renderTiebreak(matchId, score, isLocked) {
    const disabled = isLocked ? 'disabled' : '';
    const showPenalties = score.eta !== '' && score.etb !== '' && Number(score.eta) === Number(score.etb);
    return `<div class="tiebreak-box">
      <div class="tiebreak-line">
        <span>Pror.</span>
        <input class="score-input tiny" type="number" min="0" max="99" data-ko-et="${matchId}-eta" value="${score.eta || ''}" placeholder="0" ${disabled}>
        <div class="score-sep">:</div>
        <input class="score-input tiny" type="number" min="0" max="99" data-ko-et="${matchId}-etb" value="${score.etb || ''}" placeholder="0" ${disabled}>
      </div>
      ${showPenalties ? `
        <div class="tiebreak-line">
          <span>Pen.</span>
          <input class="score-input tiny" type="number" min="0" max="99" data-ko-pen="${matchId}-pena" value="${score.pena || ''}" placeholder="0" ${disabled}>
          <div class="score-sep">:</div>
          <input class="score-input tiny" type="number" min="0" max="99" data-ko-pen="${matchId}-penb" value="${score.penb || ''}" placeholder="0" ${disabled}>
        </div>` : ''}
    </div>`;
  }

  function render(container, deps) {
    let html = '<div class="phase-grid">';
    deps.phases.forEach(phase => {
      html += `<div class="group-section">
        <div class="group-header">
          <div class="group-title">${phase.label}</div>
        </div>`;
      deps.knockoutMatches.filter(match => match.phase === phase.value).forEach(match => {
        html += renderMatch(match, deps);
      });
      html += '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  window.KnockoutRenderer = {
    render
  };
})();
