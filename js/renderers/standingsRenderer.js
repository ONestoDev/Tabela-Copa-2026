(function () {
  function headerHtml() {
    return `<div class="col-header">
      <div>Pos</div>
      <div></div>
      <div>Time</div>
      <div>J</div>
      <div>V</div>
      <div>E</div>
      <div>DG</div>
      <div>Pts</div>
    </div>`;
  }

  function renderRows(rows, showGroup, options, getFlagUrl) {
    return rows.map((row, index) => {
      const statusClass = options.qualifiedSlots && index < options.qualifiedSlots ? ' qualified' : options.thirdSlots && index < options.thirdSlots ? ' third-qualified' : '';
      return `
        <div class="standings-row${statusClass}">
          <div class="standings-pos">${index+1}</div>
          <div class="standings-flag" style="background-image:url('${getFlagUrl(row.team)}')"></div>
          <div class="standings-team">${showGroup ? `Grupo ${row.group} - ` : ''}${row.team}</div>
          <div class="standings-stat">${row.played}</div>
          <div class="standings-stat">${row.wins}</div>
          <div class="standings-stat">${row.draws}</div>
          <div class="standings-stat">${row.gd > 0 ? '+' : ''}${row.gd}</div>
          <div class="standings-pts">${row.p}</div>
        </div>`;
    }).join('');
  }

  function render(container, data) {
    const {groups, standingsByGroup, thirds, getFlagUrl} = data;
    let html = '';
    groups.forEach(group => {
      html += `<div class="group-section">
        <div class="group-header">
          <div class="group-title">Grupo ${group}</div>
        </div>
        ${headerHtml()}
        ${renderRows(standingsByGroup[group], false, {qualifiedSlots:2}, getFlagUrl)}
      </div>`;
    });
    html += `<div class="group-section">
      <div class="group-header">
        <div class="group-title">Melhores terceiros lugares</div>
      </div>
      ${headerHtml()}
      ${renderRows(thirds, true, {thirdSlots:8}, getFlagUrl)}
    </div>`;
    container.innerHTML = html;
  }

  window.StandingsRenderer = {
    render
  };
})();
