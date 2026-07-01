(function () {
  function shortName(teamName) {
    if(!teamName) return '-';
    return teamName.length <= 24 ? teamName : `${teamName.slice(0, 23)}...`;
  }

  function scoreValue(score, side) {
    return score[side] === '' ? '' : score[side];
  }

  function renderTiebreak(matchId, score, isLocked) {
    if(isLocked) {
      const extraTime = score.eta !== '' && score.etb !== '' ? `Pror. ${score.eta}:${score.etb}` : '';
      const penalties = score.pena !== '' && score.penb !== '' ? `Pen. ${score.pena}:${score.penb}` : '';
      if(!extraTime && !penalties) return '';
      return `<div class="ko-tiebreak-summary">${extraTime}${penalties ? ` · ${penalties}` : ''}</div>`;
    }

    const disabled = isLocked ? 'disabled' : '';
    const showPenalties = score.eta !== '' && score.etb !== '' && Number(score.eta) === Number(score.etb);
    return `<div class="ko-tiebreak-edit">
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

  function renderMatch(match, deps) {
    const score = deps.knockoutScores[match.id] || {a:'', b:''};
    const isComplete = deps.scoreComplete(score);
    const isEditing = deps.editingKnockoutResultKeys.has(String(match.id));
    const isLocked = isComplete && !isEditing;
    const teamA = deps.resolveSpec(match.a);
    const teamB = deps.resolveSpec(match.b);
    const isAPlaceholder = teamA === deps.placeholderForSpec(match.a);
    const isBPlaceholder = teamB === deps.placeholderForSpec(match.b);
    const isDrawScore = score.a !== '' && score.b !== '' && Number(score.a) === Number(score.b);
    const tiebreakHtml = isDrawScore ? renderTiebreak(match.id, score, isLocked) : '';
    const statusLabel = isComplete ? 'Encerrado' : 'Pendente';

    return `<div class="match-card sports-card ko-card ${isComplete ? 'is-played' : 'is-pending'}" title="J${match.id} - ${teamA} x ${teamB}">
      <div class="sports-card-top">
        <div class="match-date">${match.label}</div>
        <div class="match-status ${isComplete ? 'is-final' : 'is-scheduled'}">${statusLabel}</div>
      </div>
      <div class="sports-teams">
        <div class="team-slot sports-team-row${deps.winnerClass(score, 'a')}" title="${teamA}">
          <div class="team-main">
            ${isAPlaceholder ? '<div class="flag"></div>' : `<div class="flag" style="background-image:url('${deps.getFlagUrl(teamA)}')"></div>`}
            <div class="team-info">
              <div class="team-name">${shortName(teamA)}</div>
              <div class="team-code">J${match.id}</div>
            </div>
          </div>
          <input class="score-input" type="number" min="0" max="99" data-ko-score="${match.id}-a" value="${scoreValue(score, 'a')}" placeholder="0" ${isLocked ? 'disabled' : ''}>
        </div>
        <div class="team-slot sports-team-row${deps.winnerClass(score, 'b')}" title="${teamB}">
          <div class="team-main">
            ${isBPlaceholder ? '<div class="flag"></div>' : `<div class="flag" style="background-image:url('${deps.getFlagUrl(teamB)}')"></div>`}
            <div class="team-info">
              <div class="team-name">${shortName(teamB)}</div>
              <div class="team-code">J${match.id}</div>
            </div>
          </div>
          <input class="score-input" type="number" min="0" max="99" data-ko-score="${match.id}-b" value="${scoreValue(score, 'b')}" placeholder="0" ${isLocked ? 'disabled' : ''}>
        </div>
      </div>
      <div class="ko-card-footer">
        ${tiebreakHtml || '<span class="ko-tiebreak-summary"></span>'}
        ${isComplete ? `<button class="mini-edit-btn" type="button" data-ko-result-edit="${match.id}">${isEditing ? 'OK' : 'Editar'}</button>` : '<span></span>'}
      </div>
    </div>`;
  }

  function render(container, deps) {
    let html = '<div class="knockout-hub">';
    deps.phases.forEach(phase => {
      const matches = deps.knockoutMatches.filter(match => match.phase === phase.value);
      html += `<section class="knockout-phase phase-${phase.value}">
        <div class="knockout-phase-header">
          <div class="group-title">${phase.label}</div>
          <div class="section-meta">${matches.length} jogos</div>
        </div>
        <div class="knockout-grid">`;
      matches.forEach(match => {
        html += renderMatch(match, deps);
      });
      html += '</div></section>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  window.KnockoutRenderer = {
    render
  };
})();
