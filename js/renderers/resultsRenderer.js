(function () {
  function phaseOptions(phases, selectedPhase) {
    return phases.map(phase => {
      return `<option value="${phase.value}" ${phase.value === selectedPhase ? 'selected' : ''}>${phase.label}</option>`;
    }).join('');
  }

  function renderGroupMatch(group, index, match, showPending, deps) {
    const key = `${group}${index+1}`;
    const score = deps.groupScores[key];
    if(!showPending && !deps.scoreComplete(score)) return '';
    const currentScore = score || {a:'', b:''};
    const team1 = deps.getTeamName(match[0]);
    const team2 = deps.getTeamName(match[1]);
    const date = deps.matchDates[group][index];
    const isComplete = deps.scoreComplete(currentScore);
    return `
        <div class="match-card sports-card ${deps.matchStateClass(currentScore)}">
          <div class="sports-card-top">
            <div class="match-date">${date}</div>
            <div class="match-status ${isComplete ? 'is-final' : 'is-scheduled'}">${isComplete ? 'Encerrado' : 'Pendente'}</div>
          </div>
          <div class="sports-teams">
            <div class="team-slot sports-team-row${deps.winnerClass(currentScore, 'a')}">
              <div class="team-main">
                <div class="flag" style="background-image:url('${deps.getFlagUrl(team1)}')"></div>
                <div class="team-info">
                  <div class="team-name">${team1}</div>
                  <div class="team-code">Grupo ${group}</div>
                </div>
              </div>
              <div class="score-value">${isComplete ? currentScore.a : '-'}</div>
            </div>
            <div class="team-slot sports-team-row${deps.winnerClass(currentScore, 'b')}">
              <div class="team-main">
                <div class="flag" style="background-image:url('${deps.getFlagUrl(team2)}')"></div>
                <div class="team-info">
                  <div class="team-name">${team2}</div>
                  <div class="team-code">Grupo ${group}</div>
                </div>
              </div>
              <div class="score-value">${isComplete ? currentScore.b : '-'}</div>
            </div>
          </div>
        </div>`;
  }

  function renderKnockoutMatch(match, showPending, deps) {
    const score = deps.knockoutScores[match.id];
    if(!showPending && !deps.knockoutScoreComplete(score)) return '';
    const currentScore = score || {a:'', b:''};
    const teamA = deps.resolveSpec(match.a);
    const teamB = deps.resolveSpec(match.b);
    const isAPlaceholder = teamA === deps.placeholderForSpec(match.a);
    const isBPlaceholder = teamB === deps.placeholderForSpec(match.b);
    const scoreLabel = knockoutScoreLabel(currentScore, deps);
    const isComplete = deps.knockoutScoreComplete(currentScore);
    return `
      <div class="match-card sports-card ${isComplete ? 'is-played' : 'is-pending'}">
        <div class="sports-card-top">
          <div class="match-date">${match.label}</div>
          <div class="match-status ${isComplete ? 'is-final' : 'is-scheduled'}">${isComplete ? 'Encerrado' : 'Pendente'}</div>
        </div>
        <div class="sports-teams">
          <div class="team-slot sports-team-row${deps.knockoutWinnerClass(currentScore, 'a')}">
            <div class="team-main">
              ${isAPlaceholder ? '<div class="flag"></div>' : `<div class="flag" style="background-image:url('${deps.getFlagUrl(teamA)}')"></div>`}
              <div class="team-info">
                <div class="team-name">${teamA}</div>
                <div class="team-code">J${match.id}</div>
              </div>
            </div>
            <div class="score-value">${isComplete ? currentScore.a : '-'}</div>
          </div>
          <div class="team-slot sports-team-row${deps.knockoutWinnerClass(currentScore, 'b')}">
            <div class="team-main">
              ${isBPlaceholder ? '<div class="flag"></div>' : `<div class="flag" style="background-image:url('${deps.getFlagUrl(teamB)}')"></div>`}
              <div class="team-info">
                <div class="team-name">${teamB}</div>
                <div class="team-code">J${match.id}</div>
              </div>
            </div>
            <div class="score-value">${isComplete ? currentScore.b : '-'}</div>
          </div>
        </div>
        ${isComplete && scoreLabel.includes('(') ? `<div class="sports-score-detail">${scoreLabel}</div>` : ''}
      </div>`;
  }

  function knockoutScoreLabel(score, deps) {
    if(!deps.knockoutScoreComplete(score)) return 'Pendente';
    let label = `${score.a} : ${score.b}`;
    if(Number(score.a) === Number(score.b)) {
      label += ` (pror. ${score.eta}:${score.etb}`;
      if(Number(score.eta) === Number(score.etb)) label += `, pen. ${score.pena}:${score.penb}`;
      label += ')';
    }
    return label;
  }

  function render(container, deps) {
    const selectedPhase = deps.selectedPhase || 'all';
    const selectedMeta = deps.phases.find(phase => phase.value === selectedPhase);
    let html = `<div class="filter-toolbar">
      <span class="filter-label">Filtrar fase</span>
      <select id="resultsFilter">${phaseOptions(deps.phases, selectedPhase)}</select>
    </div>`;

    if(selectedPhase.startsWith('group-')) {
      const round = Number(selectedPhase.split('-')[1]);
      const start = (round - 1) * 2;
      html += `<div class="group-section">
        <div class="group-header">
          <div class="group-title">${selectedMeta.label} - Fase de grupos</div>
        </div>
        <div class="match-grid">`;
      deps.groups.forEach(group => {
        deps.matches[group].slice(start, start + 2).forEach((match, offset) => {
          html += renderGroupMatch(group, start + offset, match, true, deps);
        });
      });
      html += '</div></div>';
    } else if(selectedPhase === 'all') {
      deps.groups.forEach(group => {
        let groupHtml = '';
        deps.matches[group].forEach((match, index) => {
          groupHtml += renderGroupMatch(group, index, match, false, deps);
        });
        if(!groupHtml) return;
        html += `<div class="group-section">
          <div class="group-header">
            <div class="group-title">Grupo ${group}</div>
          </div>
          <div class="match-grid">${groupHtml}</div>
        </div>`;
      });
    } else {
      const phaseMatches = deps.knockoutMatches.filter(match => match.phase === selectedPhase);
      const phaseHtml = phaseMatches.map(match => renderKnockoutMatch(match, true, deps)).join('');
      html += `<div class="group-section">
        <div class="group-header">
          <div class="group-title">${selectedMeta.label}</div>
        </div>
        ${phaseHtml ? `<div class="match-grid">${phaseHtml}</div>` : '<div class="empty-state">Os confrontos desta fase ainda não foram montados.</div>'}
      </div>`;
    }

    if(!html.includes('match-card') && selectedPhase === 'all') {
      html += '<div class="empty-state">Nenhum resultado lançado ainda.</div>';
    }
    container.innerHTML = html;
  }

  window.ResultsRenderer = {
    render
  };
})();
