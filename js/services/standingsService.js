(function () {
  function createStandingsService({teams, matches, groups, scoreComplete}) {
    function getTeamName(slot) {
      const group = slot.charAt(0);
      const pos = parseInt(slot.charAt(1), 10) - 1;
      return teams[group]?.[pos] || slot;
    }

    function sortTable(a, b) {
      return b.p-a.p || b.gd-a.gd || b.gf-a.gf || a.team.localeCompare(b.team);
    }

    function groupStanding(group, scores) {
      const table = {};
      matches[group].flat().forEach(slot => {
        const team = getTeamName(slot);
        table[slot] = {team, group, p:0, played:0, wins:0, draws:0, gf:0, ga:0, gd:0};
      });
      matches[group].forEach((pair, index) => {
        const key = `${group}${index+1}`;
        const score = scores[key];
        if(!scoreComplete(score)) return;
        const a = Number(score.a), b = Number(score.b);
        const [t1, t2] = pair;
        table[t1].played += 1; table[t2].played += 1;
        table[t1].gf += a; table[t1].ga += b; table[t1].gd += a-b;
        table[t2].gf += b; table[t2].ga += a; table[t2].gd += b-a;
        if(a>b) { table[t1].p += 3; table[t1].wins += 1; }
        else if(b>a) { table[t2].p += 3; table[t2].wins += 1; }
        else { table[t1].p += 1; table[t2].p += 1; table[t1].draws += 1; table[t2].draws += 1; }
      });
      return Object.values(table).sort(sortTable);
    }

    function groupComplete(group, scores) {
      return matches[group].every((pair, index) => scoreComplete(scores[`${group}${index+1}`]));
    }

    function groupHasScores(group, scores) {
      return matches[group].some((pair, index) => scoreComplete(scores[`${group}${index+1}`]));
    }

    function thirdPlaceRank(scores) {
      return groups
        .filter(group => groupHasScores(group, scores))
        .map(group => groupStanding(group, scores)[2])
        .filter(Boolean)
        .sort(sortTable)
        .slice(0, 8);
    }

    return {
      groupStanding,
      sortTable,
      groupComplete,
      groupHasScores,
      thirdPlaceRank
    };
  }

  window.StandingsService = {
    create: createStandingsService
  };
})();
