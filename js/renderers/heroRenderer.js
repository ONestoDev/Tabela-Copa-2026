(function () {
  function leaderLabel(name, points, escapeHtml) {
    if(!name) return '-';
    return `${escapeHtml(name)} (${points} pts)`;
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
      escapeHtml
    } = data;

    container.innerHTML = `
      <div class="hero-stat is-primary"><strong>${completedMatches}/${totalMatches}</strong><span>Jogos preenchidos</span></div>
      <div class="hero-stat"><strong>${completedGroupMatches}/${totalGroupMatches}</strong><span>Fase de grupos</span></div>
      <div class="hero-stat"><strong>${completedKnockoutMatches}/${totalKnockoutMatches}</strong><span>Mata-mata</span></div>
      <div class="hero-stat"><strong>${goals}</strong><span>Gols registrados</span></div>
      <div class="hero-stat"><strong>${leaderLabel(groupLeaderName, groupLeaderPoints, escapeHtml)}</strong><span>Líder grupos</span></div>
      <div class="hero-stat"><strong>${leaderLabel(knockoutLeaderName, knockoutLeaderPoints, escapeHtml)}</strong><span>Líder mata-mata</span></div>
    `;
  }

  window.HeroRenderer = {
    render
  };
})();
