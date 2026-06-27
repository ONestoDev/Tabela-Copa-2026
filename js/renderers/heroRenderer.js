(function () {
  function render(container, data) {
    const {
      completedMatches,
      totalMatches,
      goals,
      leaderName,
      nextMatchLabel,
      escapeHtml
    } = data;

    container.innerHTML = `
      <div class="hero-stat"><strong>${completedMatches}/${totalMatches}</strong><span>Jogos preenchidos</span></div>
      <div class="hero-stat"><strong>${goals}</strong><span>Gols registrados</span></div>
      <div class="hero-stat"><strong>${leaderName ? escapeHtml(leaderName) : '-'}</strong><span>Líder dos palpites</span></div>
      <div class="hero-stat"><strong>${escapeHtml(nextMatchLabel)}</strong><span>Próximo sem resultado</span></div>
    `;
  }

  window.HeroRenderer = {
    render
  };
})();
