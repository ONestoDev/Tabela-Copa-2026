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
        rows[team] = {team, gf:0, ga:0, gd:0, played:0, wins:0, draws:0, losses:0, points:0, performance:0};
      });
      return rows;
    }

    function addGoals(rows, teamFor, goalsFor, goalsAgainst) {
      if(!teamFor || isPlaceholder(teamFor)) return;
      rows[teamFor] = rows[teamFor] || {team:teamFor, gf:0, ga:0, gd:0, played:0, wins:0, draws:0, losses:0, points:0, performance:0};
      rows[teamFor].gf += goalsFor;
      rows[teamFor].ga += goalsAgainst;
      rows[teamFor].gd = rows[teamFor].gf - rows[teamFor].ga;
      rows[teamFor].played += 1;
      if(goalsFor > goalsAgainst) {
        rows[teamFor].wins += 1;
        rows[teamFor].points += 3;
      } else if(goalsFor === goalsAgainst) {
        rows[teamFor].draws += 1;
        rows[teamFor].points += 1;
      } else {
        rows[teamFor].losses += 1;
      }
      rows[teamFor].performance = performanceValue(rows[teamFor]);
    }

    function performanceValue(row) {
      if(!row.played) return 0;
      return Number(((row.points / (row.played * 3)) * 100).toFixed(1));
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
      const officialRows = officialFixtureGoalsRanking();
      if(officialRows.length) return officialRows;
      const standingsRows = officialGoalsRanking();
      if(standingsRows.length) return standingsRows;
      const rows = localFixtureGoalsRanking();
      return rows.sort((a,b) => b.gf - a.gf || a.ga - b.ga || b.gd - a.gd || a.team.localeCompare(b.team));
    }

    function localFixtureGoalsRanking() {
      const rows = emptyTeamStats();
      completedMatches().forEach(match => {
        addGoals(rows, match.teamA, match.scoreA, match.scoreB);
        addGoals(rows, match.teamB, match.scoreB, match.scoreA);
      });
      return Object.values(rows);
    }

    function officialFixtureGoalsRanking() {
      const rows = emptyTeamStats();
      officialCompletedMatches().forEach(match => {
        addGoals(rows, match.teamA, match.scoreA, match.scoreB);
        addGoals(rows, match.teamB, match.scoreB, match.scoreA);
      });
      return Object.values(rows)
        .filter(row => row.played > 0 && row.team && !isPlaceholder(row.team))
        .sort((a,b) => b.gf - a.gf || a.ga - b.ga || b.gd - a.gd || a.team.localeCompare(b.team));
    }

    function officialGoalsRanking() {
      return (apiData.standings || [])
        .flatMap(item => item.league?.standings || [])
        .flat()
        .map(row => {
          const team = apiTeamToLocal(row.team?.name);
          const gf = Number(row.all?.goals?.for) || 0;
          const ga = Number(row.all?.goals?.against) || 0;
          return {
            team,
            gf,
            ga,
            gd: Number(row.goalsDiff) || gf - ga,
            played: Number(row.all?.played) || 0,
            wins: Number(row.all?.win) || 0,
            draws: Number(row.all?.draw) || 0,
            losses: Number(row.all?.lose) || 0,
            points: Number(row.points) || 0,
            performance: performanceValue({
              played: Number(row.all?.played) || 0,
              points: Number(row.points) || 0
            })
          };
        })
        .filter(row => row.team && !isPlaceholder(row.team))
        .sort((a,b) => b.gf - a.gf || a.ga - b.ga || b.gd - a.gd || a.team.localeCompare(b.team));
    }

    function statsMatches() {
      const officialRows = officialCompletedMatches();
      if(officialRows.length) return officialRows;
      return completedMatches();
    }

    function officialCompletedMatches() {
      return officialFixtures()
        .map(fixture => {
          const score = officialScore(fixture);
          if(!score) return null;
          const teamA = apiTeamToLocal(fixture.teams?.home?.name);
          const teamB = apiTeamToLocal(fixture.teams?.away?.name);
          if(!teamA || !teamB || isPlaceholder(teamA) || isPlaceholder(teamB)) return null;
          return {
            label: fixture.league?.round || fixture.fixture?.date || 'Partida',
            teamA,
            teamB,
            scoreA: score.home,
            scoreB: score.away
          };
        })
        .filter(Boolean);
    }

    function sufferedGoalsRanking() {
      return goalsRanking().slice().sort((a,b) => b.ga - a.ga || a.team.localeCompare(b.team));
    }

    function performanceRanking() {
      return goalsRanking()
        .filter(row => row.played > 0)
        .sort((a,b) => b.performance - a.performance || b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
    }

    function unbeatenTeams() {
      return performanceRanking()
        .filter(row => row.losses === 0)
        .sort((a,b) => b.played - a.played || b.performance - a.performance || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
    }

    function biggestWin() {
      return statsMatches()
        .map(match => ({...match, margin: Math.abs(match.scoreA - match.scoreB)}))
        .filter(match => match.margin > 0)
        .sort((a,b) => b.margin - a.margin || (b.scoreA + b.scoreB) - (a.scoreA + a.scoreB))[0] || null;
    }

    function predictionComplete(prediction) {
      return prediction && prediction.a !== '' && prediction.b !== '';
    }

    function isExactPrediction(prediction, result) {
      return predictionComplete(prediction) && result && result.a !== '' && result.b !== '' &&
        Number(prediction.a) === Number(result.a) &&
        Number(prediction.b) === Number(result.b);
    }

    function addUserPredictionStats(row, prediction, result, completeResult) {
      if(!predictionComplete(prediction)) return;
      row.guesses += 1;
      if(!completeResult) return;
      row.evaluated += 1;
      const exact = isExactPrediction(prediction, result);
      const points = window.PredictionService.predictionPoints(prediction, result);
      if(exact) row.exact += 1;
      else if(points > 0) row.near += 1;
      else if(points === 0) row.missed += 1;
    }

    function userStatistics() {
      const rows = deps.state.users.map(user => ({
        user,
        guesses: 0,
        evaluated: 0,
        exact: 0,
        missed: 0,
        near: 0
      }));
      const byUser = new Map(rows.map(row => [row.user, row]));

      deps.groups.forEach(group => {
        deps.matches[group].forEach((pair, index) => {
          const key = `${group}${index + 1}`;
          const result = deps.state.scores[key];
          const completeResult = deps.scoreComplete(result);
          deps.state.users.forEach(user => {
            addUserPredictionStats(byUser.get(user), deps.state.predictions[user]?.[key], result, completeResult);
          });
        });
      });

      deps.knockoutMatches.forEach(match => {
        const result = deps.state.knockoutScores[match.id];
        const completeResult = deps.knockoutScoreComplete(result);
        deps.state.users.forEach(user => {
          addUserPredictionStats(byUser.get(user), deps.state.knockoutPredictions[user]?.[match.id], result, completeResult);
        });
      });

      const sortBy = key => rows.slice().sort((a,b) => b[key] - a[key] || b.evaluated - a.evaluated || a.user.localeCompare(b.user));
      return {
        mostGuesses: sortBy('guesses'),
        mostExact: sortBy('exact'),
        mostMissed: sortBy('missed'),
        mostNear: sortBy('near')
      };
    }

    function worldCupChampions() {
      return [
        {team:'Uruguai', countryCode:'UY', years:[1930, 1950]},
        {team:'It\u00e1lia', countryCode:'IT', years:[1934, 1938, 1982, 2006]},
        {team:'Alemanha', countryCode:'DE', years:[1954, 1974, 1990, 2014]},
        {team:'Brasil', countryCode:'BR', years:[1958, 1962, 1970, 1994, 2002]},
        {team:'Inglaterra', countryCode:'GB-ENG', years:[1966]},
        {team:'Argentina', countryCode:'AR', years:[1978, 1986, 2022]},
        {team:'Fran\u00e7a', countryCode:'FR', years:[1998, 2018]},
        {team:'Espanha', countryCode:'ES', years:[2010, 2026]}
      ].sort((a,b) => b.years.length - a.years.length || a.team.localeCompare(b.team));
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
      return {
        topScorers: takeValid(playerRows(apiData.topScorers), 'goals'),
        topAssists: takeValid(playerRows(apiData.topAssists), 'assists'),
        topGoalsFor: goalsRanking().filter(row => row.gf > 0).slice(0, 3),
        topGoalsAgainst: sufferedGoalsRanking().filter(row => row.ga > 0).slice(0, 3),
        topPerformance: performanceRanking().slice(0, 3),
        unbeatenTeams: unbeatenTeams().slice(0, 3)
      };
    }

    function render() {
      window.StatisticsRenderer.renderAll({
        topScorers: takeValid(playerRows(apiData.topScorers), 'goals', 50),
        topAssists: takeValid(playerRows(apiData.topAssists), 'assists', 50),
        performanceRanking: performanceRanking(),
        unbeatenTeams: unbeatenTeams(),
        goalsRanking: goalsRanking(),
        biggestWin: biggestWin(),
        userStatistics: userStatistics(),
        champions: worldCupChampions(),
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
