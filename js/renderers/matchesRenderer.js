(function () {
  function renderMatch(group, index, match, deps) {
    const key = `${group}${index+1}`;
    const score = deps.scores[key] || {a:'', b:''};
    const isComplete = deps.scoreComplete(score);
    const isEditing = deps.editingResultKeys.has(key);
    const isLocked = isComplete && !isEditing;
    const team1 = deps.getTeamName(match[0]);
    const team2 = deps.getTeamName(match[1]);
    const date = deps.matchDates[group][index];
    const statusLabel = isComplete ? 'Encerrado' : 'Agendado';
    return `
        <div class="match-card sports-card ${deps.matchStateClass(score)}">
          <div class="sports-card-top">
            <div class="match-date">${date}</div>
            <div class="match-status ${isComplete ? 'is-final' : 'is-scheduled'}">${statusLabel}</div>
          </div>
          <div class="sports-teams">
            <div class="team-slot sports-team-row${deps.winnerClass(score, 'a')}">
              <div class="team-main">
                <div class="flag" style="background-image:url('${deps.getFlagUrl(team1)}')"></div>
                <div class="team-info">
                  <div class="team-name">${team1}</div>
                  <div class="team-code">${match[0]}</div>
                </div>
              </div>
              <input class="score-input" type="number" min="0" max="99" data-score="${key}-a" value="${score.a === '' ? '' : score.a}" placeholder="0" ${isLocked ? 'disabled' : ''}>
            </div>
            <div class="team-slot sports-team-row${deps.winnerClass(score, 'b')}">
              <div class="team-main">
                <div class="flag" style="background-image:url('${deps.getFlagUrl(team2)}')"></div>
                <div class="team-info">
                  <div class="team-name">${team2}</div>
                  <div class="team-code">${match[1]}</div>
                </div>
              </div>
              <input class="score-input" type="number" min="0" max="99" data-score="${key}-b" value="${score.b === '' ? '' : score.b}" placeholder="0" ${isLocked ? 'disabled' : ''}>
            </div>
          </div>
          ${isComplete ? `<div class="sports-card-actions"><button class="mini-edit-btn" type="button" data-result-edit="${key}">${isEditing ? 'OK' : 'Editar'}</button></div>` : ''}
        </div>`;
  }

  function renderGroups(container, deps) {
    const selectedGroup = deps.selectedGroup || 'all';
    const visibleGroups = selectedGroup === 'all' ? deps.groups : deps.groups.filter(group => group === selectedGroup);
    const options = [
      '<option value="all">Todos os grupos</option>',
      ...deps.groups.map(group => `<option value="${group}" ${group === selectedGroup ? 'selected' : ''}>Grupo ${group}</option>`)
    ].join('');
    let html = `<div class="filter-toolbar">
      <span class="filter-label">Filtrar grupo</span>
      <select id="groupFilter">${options}</select>
    </div>`;
    visibleGroups.forEach(group => {
      html += `<div class="group-section">
        <div class="group-header">
          <div class="group-title">Grupo ${group}</div>
        </div>
        <div class="match-grid">`;
      deps.matches[group].forEach((match, index) => {
        html += renderMatch(group, index, match, deps);
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
  }

  window.MatchesRenderer = {
    renderGroups
  };
})();
