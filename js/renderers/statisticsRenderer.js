(function () {
  function valueOrDash(value) {
    if(value === undefined || value === null || value === '') return '-';
    return value;
  }

  function playerName(item) {
    return item.player?.name || item.name || '-';
  }

  function playerTeam(item) {
    return item.statistics?.[0]?.team?.name || item.team || '-';
  }

  function statValue(item, key) {
    const stats = item.statistics?.[0] || {};
    if(key === 'goals') return stats.goals?.total ?? item.goals;
    if(key === 'assists') return stats.goals?.assists ?? item.assists;
    if(key === 'yellow') return stats.cards?.yellow ?? item.yellow;
    if(key === 'red') return stats.cards?.red ?? item.red;
    if(key === 'cards') return (Number(stats.cards?.yellow) || 0) + (Number(stats.cards?.red) || 0);
    return item[key];
  }

  function teamName(row) {
    return row.localTeam || row.team || playerTeam(row);
  }

  function flagHtml(team, getFlagUrl, escapeHtml) {
    if(!team || !getFlagUrl) return '';
    return `<span class="stats-flag" style="background-image:url('${getFlagUrl(team)}')" aria-label="${escapeHtml(team)}"></span>`;
  }

  function flagByCodeHtml(team, countryCode, escapeHtml) {
    if(!countryCode) return '';
    return `<span class="stats-flag" style="background-image:url('https://flagcdn.com/w160/${String(countryCode).toLowerCase()}.png')" aria-label="${escapeHtml(team)}"></span>`;
  }

  function teamCell(row, getFlagUrl, escapeHtml) {
    const team = teamName(row);
    return `<span class="stats-team-cell">${flagHtml(team, getFlagUrl, escapeHtml)}<span>${escapeHtml(team)}</span></span>`;
  }

  function listRows(rows, columns, escapeHtml) {
    if(!rows.length) return '<div class="empty-state">Sem dados disponiveis ainda.</div>';
    const columnClass = `stats-cols-${columns.length + 1}`;
    return `
      <div class="stats-table">
        <div class="stats-row ${columnClass} header">
          <div>#</div>
          ${columns.map(column => `<div>${escapeHtml(column.label)}</div>`).join('')}
        </div>
        ${rows.map((row, index) => `
          <div class="stats-row ${columnClass}">
            <div class="leaderboard-medal">${index + 1}</div>
            ${columns.map(column => `<div>${column.html ? column.render(row) : escapeHtml(column.render(row))}</div>`).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderPlayerRanking(container, title, rows, statKey, statLabel, escapeHtml, getFlagUrl) {
    if(!container) return;
    container.innerHTML = `
      <div class="group-section">
        <div class="group-header">
          <div class="group-title">${escapeHtml(title)}</div>
          <div class="section-meta">football-data.org</div>
        </div>
        ${listRows(rows, [
          {label:'Selecao', html:true, render: row => teamCell(row, getFlagUrl, escapeHtml)},
          {label:'Jogador', render: playerName},
          {label: statLabel, render: row => valueOrDash(statValue(row, statKey))}
        ], escapeHtml)}
      </div>
    `;
  }

  function renderTeamRanking(container, title, rows, columns, escapeHtml) {
    if(!container) return;
    container.innerHTML = `
      <div class="group-section">
        <div class="group-header">
          <div class="group-title">${escapeHtml(title)}</div>
        </div>
        ${listRows(rows, columns, escapeHtml)}
      </div>
    `;
  }

  function renderBiggestWin(container, match, escapeHtml, getFlagUrl) {
    if(!container) return;
    container.innerHTML = `
      <div class="group-section">
        <div class="group-header">
          <div class="group-title">Maior goleada</div>
        </div>
        ${match ? `
          <div class="stats-highlight">
            <strong>
              <span class="stats-highlight-team">${flagHtml(match.teamA, getFlagUrl, escapeHtml)}${escapeHtml(match.teamA)}</span>
              <span class="stats-highlight-score">${match.scoreA} x ${match.scoreB}</span>
              <span class="stats-highlight-team">${flagHtml(match.teamB, getFlagUrl, escapeHtml)}${escapeHtml(match.teamB)}</span>
            </strong>
            <span>${escapeHtml(match.label)} - saldo ${match.margin}</span>
          </div>
        ` : '<div class="empty-state">Nenhuma partida preenchida ainda.</div>'}
      </div>
    `;
  }

  function renderUserRanking(container, data, escapeHtml) {
    if(!container) return;
    const rows = (data?.mostGuesses || [])
      .slice()
      .sort((a,b) => b.guesses - a.guesses || b.exact - a.exact || b.near - a.near || a.user.localeCompare(b.user));
    container.innerHTML = `
      <div class="group-section">
        <div class="group-header">
          <div class="group-title">Estatisticas dos usuarios</div>
        </div>
        ${listRows(rows, [
          {label:'Usuario', render: row => row.user},
          {label:'Total', render: row => valueOrDash(row.guesses)},
          {label:'Acertos', render: row => valueOrDash(row.exact)},
          {label:'Quase', render: row => valueOrDash(row.near)},
          {label:'Erros', render: row => valueOrDash(row.missed)}
        ], escapeHtml)}
      </div>
    `;
  }

  function renderChampions(container, rows, escapeHtml) {
    if(!container) return;
    renderTeamRanking(container, 'Campeas de todos os tempos', rows || [], [
      {label:'Selecao', html:true, render: row => `<span class="stats-team-cell">${flagByCodeHtml(row.team, row.countryCode, escapeHtml)}<span>${escapeHtml(row.team)}</span></span>`},
      {label:'Titulos', render: row => valueOrDash(row.years.length)},
      {label:'Anos', render: row => row.years.join(', ')}
    ], escapeHtml);
  }

  function percent(value) {
    if(value === undefined || value === null || value === '') return '-';
    return `${value}%`;
  }

  function renderAll(data) {
    const {escapeHtml, getFlagUrl} = data;
    renderPlayerRanking(document.getElementById('stats-artilharia-panel'), 'Artilharia', data.topScorers, 'goals', 'Gols', escapeHtml, getFlagUrl);
    renderPlayerRanking(document.getElementById('stats-assistencias-panel'), 'Assistencias', data.topAssists, 'assists', 'Assist.', escapeHtml, getFlagUrl);
    renderTeamRanking(document.getElementById('stats-desempenho-panel'), 'Desempenho das selecoes', data.performanceRanking, [
      {label:'Selecao', html:true, render: row => teamCell(row, getFlagUrl, escapeHtml)},
      {label:'J', render: row => valueOrDash(row.played)},
      {label:'V', render: row => valueOrDash(row.wins)},
      {label:'E', render: row => valueOrDash(row.draws)},
      {label:'D', render: row => valueOrDash(row.losses)},
      {label:'Pts', render: row => valueOrDash(row.points)},
      {label:'Aprov.', render: row => percent(row.performance)}
    ], escapeHtml);
    renderTeamRanking(document.getElementById('stats-gols-panel'), 'Gols marcados e sofridos', data.goalsRanking, [
      {label:'Selecao', html:true, render: row => teamCell(row, getFlagUrl, escapeHtml)},
      {label:'GP', render: row => valueOrDash(row.gf)},
      {label:'GC', render: row => valueOrDash(row.ga)},
      {label:'Saldo', render: row => row.gd > 0 ? `+${row.gd}` : row.gd}
    ], escapeHtml);
    renderTeamRanking(document.getElementById('stats-invictas-panel'), 'Selecoes invictas', data.unbeatenTeams, [
      {label:'Selecao', html:true, render: row => teamCell(row, getFlagUrl, escapeHtml)},
      {label:'J', render: row => valueOrDash(row.played)},
      {label:'V', render: row => valueOrDash(row.wins)},
      {label:'E', render: row => valueOrDash(row.draws)},
      {label:'GP', render: row => valueOrDash(row.gf)},
      {label:'GC', render: row => valueOrDash(row.ga)}
    ], escapeHtml);
    renderBiggestWin(document.getElementById('stats-goleada-panel'), data.biggestWin, escapeHtml, getFlagUrl);
    renderUserRanking(document.getElementById('stats-usuarios-panel'), data.userStatistics, escapeHtml);
    renderChampions(document.getElementById('stats-campeas-panel'), data.champions, escapeHtml);
  }

  window.StatisticsRenderer = {
    renderAll,
    statValue,
    playerName,
    playerTeam
  };
})();
