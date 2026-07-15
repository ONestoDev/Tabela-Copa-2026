(function () {
  function create(deps) {
    function allMatches() {
      return deps.groups.flatMap(group => {
        return deps.matches[group].map((pair, index) => {
          const teamA = deps.getTeamName(pair[0]);
          const teamB = deps.getTeamName(pair[1]);
          return {
            type: 'group',
            group,
            index,
            key: `${group}${index+1}`,
            pair,
            label: deps.matchDates[group][index],
            teamA,
            teamB,
            name: `${teamA} x ${teamB}`,
            score: deps.state.scores[`${group}${index+1}`]
          };
        });
      });
    }

    function allKnockoutMatches() {
      return deps.knockoutMatches.map(match => {
        const teamA = deps.resolveSpec(match.a);
        const teamB = deps.resolveSpec(match.b);
        return {
          type: 'knockout',
          key: String(match.id),
          score: deps.state.knockoutScores[match.id],
          label: match.label,
          teamA,
          teamB,
          name: `${teamA} x ${teamB}`
        };
      });
    }

    function knockoutScoreComplete(score) {
      if(!score || score.a === '' || score.b === '') return false;
      if(Number(score.a) !== Number(score.b)) return true;
      if(score.eta === '' || score.etb === '') return false;
      if(Number(score.eta) !== Number(score.etb)) return true;
      return score.pena !== '' && score.penb !== '' && Number(score.pena) !== Number(score.penb);
    }

    function predictionLeader(totalForUser, exactForUser) {
      return deps.state.users
        .map(user => ({user, points:totalForUser(user), exact:exactForUser(user)}))
        .sort((a,b) => b.points-a.points || b.exact-a.exact || a.user.localeCompare(b.user))[0];
    }

    function overallLeader() {
      return deps.state.users
        .map(user => ({
          user,
          points: deps.userPredictionTotal(user) + deps.userKnockoutPredictionTotal(user),
          exact: deps.userPredictionExactCount(user) + deps.userKnockoutPredictionExactCount(user)
        }))
        .sort((a,b) => b.points-a.points || b.exact-a.exact || a.user.localeCompare(b.user))[0];
    }

    function resultSummary(item) {
      if(!item || !item.score) return null;
      return {
        teamA: item.teamA,
        teamB: item.teamB,
        label: `${item.score.a}:${item.score.b} · ${item.label}`
      };
    }

    function buildHeroStats() {
      const groupItems = allMatches();
      const knockoutItems = allKnockoutMatches();
      const groupCompleted = groupItems.filter(item => deps.scoreComplete(item.score));
      const knockoutCompleted = knockoutItems.filter(item => knockoutScoreComplete(item.score));
      const completed = [...groupCompleted, ...knockoutCompleted];
      const totalMatches = groupItems.length + knockoutItems.length;
      const goals = groupCompleted.reduce((sum, item) => {
        return sum + Number(item.score.a) + Number(item.score.b);
      }, 0) + knockoutCompleted.reduce((sum, item) => {
        return sum + Number(item.score.a) + Number(item.score.b);
      }, 0);
      const groupLeader = predictionLeader(deps.userPredictionTotal, deps.userPredictionExactCount);
      const knockoutLeader = predictionLeader(deps.userKnockoutPredictionTotal, deps.userKnockoutPredictionExactCount);
      const leader = overallLeader();
      const next = [...groupItems, ...knockoutItems].find(item => {
        return item.type === 'group' ? !deps.scoreComplete(item.score) : !knockoutScoreComplete(item.score);
      });
      const last = completed[completed.length - 1];
      const nextMatch = next ? {teamA: next.teamA, teamB: next.teamB, label: next.label} : null;
      const progressPercent = totalMatches ? Math.round((completed.length / totalMatches) * 100) : 0;

      window.HeroRenderer.render(document.getElementById('heroStats'), {
        completedMatches: completed.length,
        totalMatches,
        completedGroupMatches: groupCompleted.length,
        totalGroupMatches: groupItems.length,
        completedKnockoutMatches: knockoutCompleted.length,
        totalKnockoutMatches: knockoutItems.length,
        goals,
        groupLeaderName: groupLeader?.user,
        groupLeaderPoints: groupLeader?.points || 0,
        knockoutLeaderName: knockoutLeader?.user,
        knockoutLeaderPoints: knockoutLeader?.points || 0,
        tournamentStats: deps.tournamentStats ? deps.tournamentStats() : null,
        getFlagUrl: deps.getFlagUrl,
        escapeHtml: deps.escapeHtml
      });

      window.LivePanelRenderer.render(document.getElementById('livePanel'), {
        nextMatch,
        lastResult: resultSummary(last),
        overallLeaderName: leader?.user,
        overallLeaderPoints: leader?.points || 0,
        progressPercent,
        getFlagUrl: deps.getFlagUrl,
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
