(function () {
  function flags(match, getFlagUrl, escapeHtml) {
    if(!match) return '<strong>-</strong>';
    return `<div class="live-flags" title="${escapeHtml(match.teamA)} x ${escapeHtml(match.teamB)}">
      <span class="live-flag" style="background-image:url('${getFlagUrl(match.teamA)}')" aria-label="${escapeHtml(match.teamA)}"></span>
      <span class="live-vs">x</span>
      <span class="live-flag" style="background-image:url('${getFlagUrl(match.teamB)}')" aria-label="${escapeHtml(match.teamB)}"></span>
    </div>
    <span class="live-detail">${escapeHtml(match.label)}</span>`;
  }

  function render(container, data) {
    if(!container) return;
    const {
      nextMatch,
      lastResult,
      overallLeaderName,
      overallLeaderPoints,
      progressPercent,
      getFlagUrl,
      escapeHtml
    } = data;

    container.innerHTML = `
      <div class="live-card is-next">
        <span class="live-kicker">Próximo</span>
        ${flags(nextMatch, getFlagUrl, escapeHtml)}
      </div>
      <div class="live-card">
        <span class="live-kicker">Último resultado</span>
        ${flags(lastResult, getFlagUrl, escapeHtml)}
      </div>
      <div class="live-card">
        <span class="live-kicker">Líder geral</span>
        <strong>${overallLeaderName ? `${escapeHtml(overallLeaderName)} (${overallLeaderPoints} pts)` : '-'}</strong>
      </div>
      <div class="live-card is-progress">
        <span class="live-kicker">Progresso</span>
        <strong>${progressPercent}%</strong>
        <div class="progress-track"><div style="width:${progressPercent}%"></div></div>
      </div>
    `;
  }

  window.LivePanelRenderer = {
    render
  };
})();
