(function () {
  function create(deps) {
    function allMatches() {
      return deps.groups.flatMap(group => {
        return deps.matches[group].map((pair, index) => ({
          group,
          index,
          key: `${group}${index+1}`,
          pair
        }));
      });
    }

    function buildHeroStats() {
      const items = allMatches();
      const completed = items.filter(item => deps.scoreComplete(deps.state.scores[item.key]));
      const goals = completed.reduce((sum, item) => {
        return sum + Number(deps.state.scores[item.key].a) + Number(deps.state.scores[item.key].b);
      }, 0);
      const leader = deps.state.users
        .map(user => ({user, points:deps.userPredictionTotal(user)}))
        .sort((a,b) => b.points-a.points || a.user.localeCompare(b.user))[0];
      const next = items.find(item => !deps.scoreComplete(deps.state.scores[item.key]));
      const nextLabel = next ? `${deps.getTeamName(next.pair[0])} x ${deps.getTeamName(next.pair[1])}` : 'Tabela completa';
      window.HeroRenderer.render(document.getElementById('heroStats'), {
        completedMatches: completed.length,
        totalMatches: items.length,
        goals,
        leaderName: leader?.user,
        nextMatchLabel: nextLabel,
        escapeHtml: deps.escapeHtml
      });
    }

    function buildTabela() {
      const standingsByGroup = {};
      deps.groups.forEach(group => {
        standingsByGroup[group] = deps.standingsService.groupStanding(group, deps.state.scores);
      });
      const thirds = deps.groups
        .map(group => deps.standingsService.groupStanding(group, deps.state.scores)[2])
        .filter(Boolean)
        .sort(deps.standingsService.sortTable);
      window.StandingsRenderer.render(document.getElementById('tabelaContent'), {
        groups: deps.groups,
        standingsByGroup,
        thirds,
        getFlagUrl: deps.getFlagUrl
      });
    }

    return {
      buildHeroStats,
      buildTabela
    };
  }

  window.OverviewController = {
    create
  };
})();
