(function () {
  function create(deps) {
    function allMatches() {
      return deps.groups.flatMap(group => {
        return deps.matches[group].map((pair, index) => ({
          type: 'group',
          group,
          index,
          key: `${group}${index+1}`,
          pair,
          label: deps.matchDates[group][index],
          name: `${deps.getTeamName(pair[0])} x ${deps.getTeamName(pair[1])}`
        }));
      });
    }

    function allKnockoutMatches() {
      return deps.knockoutMatches.map(match => ({
        type: 'knockout',
        key: String(match.id),
        score: deps.state.knockoutScores[match.id],
        label: match.label,
        name: `${deps.resolveSpec(match.a)} x ${deps.resolveSpec(match.b)}`
      }));
    }

    function knockoutScoreComplete(score) {
      if(!score || score.a === '' || score.b === '') return false;
      if(Number(score.a) !== Number(score.b)) return true;
      if(score.eta === '' || score.etb === '') return false;
      if(Number(score.eta) !== Number(score.etb)) return true;
      return score.pena !== '' && score.penb !== '' && Number(score.pena) !== Number(score.penb);
    }

    function buildHeroStats() {
      const groupItems = allMatches();
      const knockoutItems = allKnockoutMatches();
      const groupCompleted = groupItems.filter(item => deps.scoreComplete(deps.state.scores[item.key]));
      const knockoutCompleted = knockoutItems.filter(item => knockoutScoreComplete(item.score));
      const completed = [...groupCompleted, ...knockoutCompleted];
      const goals = groupCompleted.reduce((sum, item) => {
        return sum + Number(deps.state.scores[item.key].a) + Number(deps.state.scores[item.key].b);
      }, 0) + knockoutCompleted.reduce((sum, item) => {
        return sum + Number(item.score.a) + Number(item.score.b);
      }, 0);
      const leader = deps.state.users
        .map(user => ({user, points:deps.userPredictionTotal(user), exact:deps.userPredictionExactCount(user)}))
        .sort((a,b) => b.points-a.points || b.exact-a.exact || a.user.localeCompare(b.user))[0];
      const next = [...groupItems, ...knockoutItems].find(item => {
        return item.type === 'group' ? !deps.scoreComplete(deps.state.scores[item.key]) : !knockoutScoreComplete(item.score);
      });
      const nextLabel = next ? `${next.name} · ${next.label}` : 'Tabela completa';
      window.HeroRenderer.render(document.getElementById('heroStats'), {
        completedMatches: completed.length,
        totalMatches: groupItems.length + knockoutItems.length,
        completedGroupMatches: groupCompleted.length,
        totalGroupMatches: groupItems.length,
        completedKnockoutMatches: knockoutCompleted.length,
        totalKnockoutMatches: knockoutItems.length,
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
