(function () {
  function create(deps) {
    let apiData = window.FootballApiService.cachedTournamentStats();
    let loading = false;

    function isPlaceholder(team) {
      return /^(Vencedor|Perdedor|A definir|\d)/.test(team || '');
    }

    function emptyTeamStats() {
      const rows = {};
      Object.values(deps.teams).flat().forEach(team => {
        rows[team] = {team, gf:0, ga:0, gd:0, played:0};
      });
      return rows;
    }

    function addGoals(rows, teamFor, goalsFor, goalsAgainst) {
      if(!teamFor || isPlaceholder(teamFor)) return;
      rows[teamFor] = rows[teamFor] || {team:teamFor, gf:0, ga:0, gd:0, played:0};
      rows[teamFor].gf += goalsFor;
      rows[teamFor].ga += goalsAgainst;
      rows[teamFor].gd = rows[teamFor].gf - rows[teamFor].ga;
      rows[teamFor].played += 1;
    }

    function completedMatches() {
      const items = [];
      deps.groups.forEach(group => {
        deps.matches[group].forEach((pair, index) => {
          const score = deps.state.scores[`${group}${index + 1}`];
          if(!deps.scoreComplete(score)) return;
          items.push({
            label: deps.matchDates[group][index],
            teamA: deps.getTeamName(pair[0]),
            teamB: deps.getTeamName(pair[1]),
            scoreA: Number(score.a),
            scoreB: Number(score.b)
          });
        });
      });
      deps.knockoutMatches.forEach(match => {
        const score = deps.state.knockoutScores[match.id];
        if(!deps.knockoutScoreComplete(score)) return;
        const teamA = deps.resolveSpec(match.a);
        const teamB = deps.resolveSpec(match.b);
        items.push({
          label: match.label,
          teamA,
          teamB,
          scoreA: Number(score.a),
          scoreB: Number(score.b)
        });
      });
      return items;
    }

    function goalsRanking() {
      const rows = emptyTeamStats();
      completedMatches().forEach(match => {
        addGoals(rows, match.teamA, match.scoreA, match.scoreB);
        addGoals(rows, match.teamB, match.scoreB, match.scoreA);
      });
      return Object.values(rows).sort((a,b) => b.gf - a.gf || a.ga - b.ga || b.gd - a.gd || a.team.localeCompare(b.team));
    }

    function sufferedGoalsRanking() {
      return goalsRanking().slice().sort((a,b) => b.ga - a.ga || a.team.localeCompare(b.team));
    }

    function biggestWin() {
      return completedMatches()
        .map(match => ({...match, margin: Math.abs(match.scoreA - match.scoreB)}))
        .filter(match => match.margin > 0)
        .sort((a,b) => b.margin - a.margin || (b.scoreA + b.scoreB) - (a.scoreA + a.scoreB))[0] || null;
    }

    function cardRanking() {
      const rows = {};
      function add(row, color) {
        const team = apiTeamToLocal(window.StatisticsRenderer.playerTeam(row));
        if(!team || team === '-') return;
        rows[team] = rows[team] || {team, yellow:0, red:0, total:0};
        const value = Number(window.StatisticsRenderer.statValue(row, color)) || 0;
        rows[team][color] += value;
        rows[team].total += value;
      }
      (apiData.topYellowCards || []).forEach(row => add(row, 'yellow'));
      (apiData.topRedCards || []).forEach(row => add(row, 'red'));
      return Object.values(rows).sort((a,b) => b.total - a.total || b.red - a.red || a.team.localeCompare(b.team));
    }

    function enrichPlayerRow(row) {
      const localTeam = apiTeamToLocal(window.StatisticsRenderer.playerTeam(row));
      return {
        ...row,
        name: window.StatisticsRenderer.playerName(row),
        team: localTeam,
        localTeam,
        goals: window.StatisticsRenderer.statValue(row, 'goals'),
        assists: window.StatisticsRenderer.statValue(row, 'assists'),
        yellow: window.StatisticsRenderer.statValue(row, 'yellow'),
        red: window.StatisticsRenderer.statValue(row, 'red')
      };
    }

    function playerRows(rows) {
      return (rows || []).map(enrichPlayerRow);
    }

    function takeValid(rows, key, limit = 3) {
      return (rows || [])
        .filter(row => Number(window.StatisticsRenderer.statValue(row, key)) > 0)
        .slice(0, limit);
    }

    function normalizeName(value) {
      return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    }

    function localTeamByCode(code, hint = '') {
      const teams = Object.values(deps.teams).flat();
      const matches = teams.filter(team => deps.countryCodes[team] === code);
      if(matches.length <= 1) return matches[0] || '';
      const normalizedHint = normalizeName(hint);
      if(normalizedHint.includes('scotland')) return matches.find(team => normalizeName(team).startsWith('esc')) || matches[0];
      if(normalizedHint.includes('england')) return matches.find(team => normalizeName(team).startsWith('ing')) || matches[0];
      return matches[0];
    }

    function apiTeamToLocal(teamName) {
      const aliases = {
        mexico:'MX',
        southafrica:'ZA',
        korearepublic:'KR',
        southkorea:'KR',
        czechrepublic:'CZ',
        canada:'CA',
        bosniaandherzegovina:'BA',
        qatar:'QA',
        switzerland:'CH',
        brazil:'BR',
        morocco:'MA',
        haiti:'HT',
        scotland:'GB',
        unitedstates:'US',
        usa:'US',
        paraguay:'PY',
        australia:'AU',
        turkey:'TR',
        turkiye:'TR',
        germany:'DE',
        curacao:'CW',
        ivorycoast:'CI',
        cotedivoire:'CI',
        ecuador:'EC',
        netherlands:'NL',
        holland:'NL',
        japan:'JP',
        sweden:'SE',
        tunisia:'TN',
        belgium:'BE',
        egypt:'EG',
        iran:'IR',
        newzealand:'NZ',
        spain:'ES',
        caboverde:'CV',
        saudiarabia:'SA',
        uruguay:'UY',
        france:'FR',
        senegal:'SN',
        iraq:'IQ',
        norway:'NO',
        argentina:'AR',
        algeria:'DZ',
        austria:'AT',
        jordan:'JO',
        portugal:'PT',
        drcongo:'CD',
        congodr:'CD',
        congodemocraticrepublic:'CD',
        uzbekistan:'UZ',
        colombia:'CO',
        england:'GB-ENG',
        croatia:'HR',
        ghana:'GH',
        panama:'PA'
      };
      const key = normalizeName(teamName);
      const exactLocal = Object.values(deps.teams).flat().find(team => normalizeName(team) === key);
      if(exactLocal) return exactLocal;
      return localTeamByCode(aliases[key], teamName) || teamName;
    }

    function officialFixtures() {
      const byId = new Map();
      (apiData.fixtures || []).forEach(item => byId.set(item.fixture?.id, item));
      (apiData.liveFixtures || []).forEach(item => byId.set(item.fixture?.id, item));
      return Array.from(byId.values());
    }

    function officialScore(fixture) {
      const status = fixture.fixture?.status?.short;
      const scoreStatuses = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'FT', 'AET', 'PEN'];
      if(!scoreStatuses.includes(status)) return null;
      const home = fixture.goals?.home;
      const away = fixture.goals?.away;
      if(home === null || home === undefined || away === null || away === undefined) return null;
      return {home:Number(home), away:Number(away)};
    }

    function setScore(target, key, a, b) {
      const current = target[key] || {};
      if(String(current.a ?? '') === String(a) && String(current.b ?? '') === String(b)) return false;
      target[key] = {...current, a:String(a), b:String(b)};
      return true;
    }

    function matchGroupFixture(home, away, score) {
      for(const group of deps.groups) {
        for(let index = 0; index < deps.matches[group].length; index += 1) {
          const pair = deps.matches[group][index];
          const teamA = deps.getTeamName(pair[0]);
          const teamB = deps.getTeamName(pair[1]);
          const key = `${group}${index + 1}`;
          if(teamA === home && teamB === away) return setScore(deps.state.scores, key, score.home, score.away);
          if(teamA === away && teamB === home) return setScore(deps.state.scores, key, score.away, score.home);
        }
      }
      return false;
    }

    function phaseFromRound(round) {
      const normalized = normalizeName(round);
      if(normalized.includes('third') || normalized.includes('3rd')) return 'third';
      if(normalized.includes('final')) return 'final';
      if(normalized.includes('semifinal')) return 'sf';
      if(normalized.includes('quarter')) return 'qf';
      if(normalized.includes('roundof16')) return 'r16';
      if(normalized.includes('roundof32')) return 'r32';
      return '';
    }

    function matchKnockoutFixture(home, away, score, fixture) {
      const apiPhase = phaseFromRound(fixture.league?.round || '');
      for(const match of deps.knockoutMatches) {
        const teamA = deps.resolveSpec(match.a);
        const teamB = deps.resolveSpec(match.b);
        if(!isPlaceholder(teamA) && !isPlaceholder(teamB)) {
          if(teamA === home && teamB === away) return setScore(deps.state.knockoutScores, match.id, score.home, score.away);
          if(teamA === away && teamB === home) return setScore(deps.state.knockoutScores, match.id, score.away, score.home);
        }
      }
      const fallback = deps.knockoutMatches.find(match => match.phase === apiPhase);
      if(!fallback || !['third', 'final'].includes(apiPhase)) return false;
      return setScore(deps.state.knockoutScores, fallback.id, score.home, score.away);
    }

    function syncOfficialScores() {
      let changed = false;
      officialFixtures().forEach(fixture => {
        const score = officialScore(fixture);
        if(!score) return;
        const home = apiTeamToLocal(fixture.teams?.home?.name);
        const away = apiTeamToLocal(fixture.teams?.away?.name);
        changed = matchGroupFixture(home, away, score) || matchKnockoutFixture(home, away, score, fixture) || changed;
      });
      if(changed) {
        deps.save({replaceRemote:true});
        deps.render();
      }
    }

    function heroPayload() {
      const cards = cardRanking();
      return {
        topScorers: takeValid(playerRows(apiData.topScorers), 'goals'),
        topAssists: takeValid(playerRows(apiData.topAssists), 'assists'),
        topGoalsFor: goalsRanking().filter(row => row.gf > 0).slice(0, 3),
        topGoalsAgainst: sufferedGoalsRanking().filter(row => row.ga > 0).slice(0, 3),
        mostCards: cards.slice(0, 3),
        fewestCards: cards.slice().reverse().slice(0, 3)
      };
    }

    function render() {
      window.StatisticsRenderer.renderAll({
        topScorers: takeValid(playerRows(apiData.topScorers), 'goals', 50),
        topAssists: takeValid(playerRows(apiData.topAssists), 'assists', 50),
        cardRanking: cardRanking(),
        goalsRanking: goalsRanking(),
        biggestWin: biggestWin(),
        getFlagUrl: deps.getFlagUrl,
        escapeHtml: deps.escapeHtml
      });
    }

    async function refresh() {
      if(loading) return;
      loading = true;
      try {
        apiData = await window.FootballApiService.loadTournamentStats();
        syncOfficialScores();
        deps.render();
      } catch (error) {
        console.error(error);
      } finally {
        loading = false;
      }
    }

    return {
      render,
      refresh,
      heroPayload
    };
  }

  window.StatisticsController = {
    create
  };
})();
