(function () {
  function leaderLabel(name, points, escapeHtml) {
    if(!name) return '-';
    return `${escapeHtml(name)} (${points} pts)`;
  }

  function flag(team, getFlagUrl, escapeHtml) {
    if(!team || !getFlagUrl) return '';
    return `<span class="hero-top-flag" style="background-image:url('${getFlagUrl(team)}')" aria-label="${escapeHtml(team)}"></span>`;
  }

  function playerTopList(rows, valueKey, escapeHtml, getFlagUrl) {
    if(!rows || !rows.length) return '-';
    return `<div class="hero-top-list">${rows.slice(0, 3).map(row => {
      const team = row.localTeam || window.StatisticsRenderer?.playerTeam?.(row) || row.team || '-';
      const name = row.name || window.StatisticsRenderer?.playerName?.(row) || '-';
      const value = row[valueKey] ?? window.StatisticsRenderer?.statValue?.(row, valueKey);
      return `<span class="hero-top-item">${flag(team, getFlagUrl, escapeHtml)}<span class="hero-top-name">${escapeHtml(name)}</span><em>${value ?? '-'}</em></span>`;
    }).join('')}</div>`;
  }

  function teamTopList(rows, valueKey, escapeHtml, getFlagUrl) {
    if(!rows || !rows.length) return '-';
    return `<div class="hero-top-list">${rows.slice(0, 3).map(row => {
      const team = row.team || '-';
      let value = row[valueKey] ?? '-';
      if(valueKey === 'performance' && value !== '-') value = `${value}%`;
      if(valueKey === 'played' && value !== '-') value = `${value}J`;
      return `<span class="hero-top-item">${flag(team, getFlagUrl, escapeHtml)}<em>${value}</em></span>`;
    }).join('')}</div>`;
  }

  function render(container, data) {
    const {
      completedMatches,
      totalMatches,
      completedGroupMatches,
      totalGroupMatches,
      completedKnockoutMatches,
      totalKnockoutMatches,
      goals,
      groupLeaderName,
      groupLeaderPoints,
      knockoutLeaderName,
      knockoutLeaderPoints,
      tournamentStats,
      getFlagUrl,
      escapeHtml
    } = data;

    container.innerHTML = `
      <div class="hero-stat is-primary"><strong>${completedMatches}/${totalMatches}</strong><span>Jogos preenchidos</span></div>
      <div class="hero-stat"><strong>${completedGroupMatches}/${totalGroupMatches}</strong><span>Fase de grupos</span></div>
      <div class="hero-stat"><strong>${completedKnockoutMatches}/${totalKnockoutMatches}</strong><span>Mata-mata</span></div>
      <div class="hero-stat"><strong>${goals}</strong><span>Gols registrados</span></div>
      <div class="hero-stat"><strong>${leaderLabel(groupLeaderName, groupLeaderPoints, escapeHtml)}</strong><span>Lider grupos</span></div>
      <div class="hero-stat"><strong>${leaderLabel(knockoutLeaderName, knockoutLeaderPoints, escapeHtml)}</strong><span>Lider mata-mata</span></div>
      <div class="hero-stat is-wide"><strong>${playerTopList(tournamentStats?.topScorers, 'goals', escapeHtml, getFlagUrl)}</strong><span>Top 3 artilharia</span></div>
      <div class="hero-stat is-wide"><strong>${playerTopList(tournamentStats?.topAssists, 'assists', escapeHtml, getFlagUrl)}</strong><span>Top 3 assistencias</span></div>
      <div class="hero-stat is-wide"><strong>${teamTopList(tournamentStats?.topGoalsFor, 'gf', escapeHtml, getFlagUrl)}</strong><span>Top 3 gols marcados</span></div>
      <div class="hero-stat is-wide"><strong>${teamTopList(tournamentStats?.topGoalsAgainst, 'ga', escapeHtml, getFlagUrl)}</strong><span>Top 3 gols sofridos</span></div>
      <div class="hero-stat is-wide"><strong>${teamTopList(tournamentStats?.topPerformance, 'performance', escapeHtml, getFlagUrl)}</strong><span>Melhor aproveitamento</span></div>
      <div class="hero-stat is-wide"><strong>${teamTopList(tournamentStats?.unbeatenTeams, 'played', escapeHtml, getFlagUrl)}</strong><span>Selecoes invictas</span></div>
    `;
  }

  window.HeroRenderer = {
    render
  };
})();
