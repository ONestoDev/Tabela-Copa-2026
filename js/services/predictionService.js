(function () {
  function resultSign(a, b) {
    if(a > b) return 'A';
    if(b > a) return 'B';
    return 'E';
  }

  function predictionPoints(prediction, result) {
    if(!prediction || prediction.a === '' || prediction.b === '' || !result || result.a === '' || result.b === '') return null;
    const pa = Number(prediction.a), pb = Number(prediction.b), ra = Number(result.a), rb = Number(result.b);
    if(pa === ra && pb === rb) return 50;
    return resultSign(pa, pb) === resultSign(ra, rb) ? 25 : 0;
  }

  function feedbackLabel(points) {
    if(points === 50) return 'Na mosca';
    if(points === 25) return 'Quase crava';
    if(points === 0) return 'Que azar';
    return 'Aguardando';
  }

  function feedbackText(result, points) {
    if(!result || result.a === '' || result.b === '') return 'Resultado: pendente';
    if(points === null) return `Resultado: ${result.a}:${result.b} - aguardando palpite`;
    return `Resultado: ${result.a}:${result.b} - ${points} pontos · ${feedbackLabel(points)}`;
  }

  function createLockService({scoreComplete, lockMinutes = 60, defaultKickoffHour = 12, year = 2026}) {
    function matchKickoffDate(dateLabel) {
      if(!dateLabel) return null;
      const [dayText, monthText] = dateLabel.toLowerCase().split(' ');
      const months = {jan:0, fev:1, mar:2, abr:3, mai:4, jun:5, jul:6, ago:7, set:8, out:9, nov:10, dez:11};
      const day = Number(dayText);
      const month = months[monthText];
      if(!day || month === undefined) return null;
      return new Date(year, month, day, defaultKickoffHour, 0, 0, 0);
    }

    function lockedByTime(dateLabel) {
      const kickoff = matchKickoffDate(dateLabel);
      if(!kickoff) return false;
      return Date.now() >= kickoff.getTime() - lockMinutes * 60 * 1000;
    }

    function predictionLocked(result, dateLabel) {
      return scoreComplete(result) || lockedByTime(dateLabel);
    }

    function lockedLabel(result, dateLabel) {
      if(scoreComplete(result)) return 'Palpite bloqueado: resultado lan\u00e7ado';
      if(lockedByTime(dateLabel)) return 'Palpite bloqueado: prazo encerrado';
      return '';
    }

    return {
      matchKickoffDate,
      lockedByTime,
      predictionLocked,
      lockedLabel
    };
  }

  function createScoreService({groups, matches, knockoutMatches}) {
    function groupTotal(user, state) {
      const predictions = (state.predictions || {})[user] || {};
      return groups.reduce((sum, group) => {
        return sum + matches[group].reduce((groupSum, pair, index) => {
          const key = `${group}${index + 1}`;
          return groupSum + (predictionPoints(predictions[key], state.scores[key]) || 0);
        }, 0);
      }, 0);
    }

    function knockoutTotal(user, state) {
      const predictions = (state.knockoutPredictions || {})[user] || {};
      return knockoutMatches.reduce((sum, match) => {
        return sum + (predictionPoints(predictions[match.id], state.knockoutScores[match.id]) || 0);
      }, 0);
    }

    return {
      groupTotal,
      knockoutTotal
    };
  }

  window.PredictionService = {
    resultSign,
    predictionPoints,
    feedbackLabel,
    feedbackText,
    createLockService,
    createScoreService
  };
})();
