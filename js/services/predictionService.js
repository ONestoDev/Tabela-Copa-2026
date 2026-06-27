(function () {
  function resultSign(a, b) {
    if(a > b) return 'A';
    if(b > a) return 'B';
    return 'E';
  }

  function valueComplete(value) {
    return value !== undefined && value !== null && value !== '';
  }

  function pairComplete(value, prefix = '') {
    return value && valueComplete(value[`${prefix}a`]) && valueComplete(value[`${prefix}b`]);
  }

  function pairSign(value, prefix = '') {
    return resultSign(Number(value[`${prefix}a`]), Number(value[`${prefix}b`]));
  }

  function exactMainScore(prediction, result) {
    return prediction && result && prediction.a !== '' && prediction.b !== '' &&
      result.a !== '' && result.b !== '' &&
      Number(prediction.a) === Number(result.a) &&
      Number(prediction.b) === Number(result.b);
  }

  function exactCount(prediction, result) {
    return exactMainScore(prediction, result) ? 1 : 0;
  }

  function tiebreakPoints(prediction, result) {
    if(!prediction || !result || resultSign(Number(result.a), Number(result.b)) !== 'E') return 0;
    if(resultSign(Number(prediction.a), Number(prediction.b)) !== 'E') return 0;

    let points = 0;
    if(pairComplete(prediction, 'et') && pairComplete(result, 'et')) {
      const exactExtraTime = Number(prediction.eta) === Number(result.eta) && Number(prediction.etb) === Number(result.etb);
      const resultExtraTimeSign = pairSign(result, 'et');
      if(exactExtraTime) points += 20;
      else if(resultExtraTimeSign !== 'E' && pairSign(prediction, 'et') === resultExtraTimeSign) points += 10;
    }

    if(pairComplete(result, 'et') && pairSign(result, 'et') === 'E' && pairComplete(prediction, 'pen') && pairComplete(result, 'pen')) {
      const exactPenalties = Number(prediction.pena) === Number(result.pena) && Number(prediction.penb) === Number(result.penb);
      if(exactPenalties) points += 30;
      else if(pairSign(result, 'pen') !== 'E' && pairSign(prediction, 'pen') === pairSign(result, 'pen')) points += 15;
    }

    return points;
  }

  function predictionPoints(prediction, result) {
    if(!prediction || prediction.a === '' || prediction.b === '' || !result || result.a === '' || result.b === '') return null;
    const pa = Number(prediction.a), pb = Number(prediction.b), ra = Number(result.a), rb = Number(result.b);
    const mainPoints = pa === ra && pb === rb ? 50 : resultSign(pa, pb) === resultSign(ra, rb) ? 25 : 0;
    return mainPoints + tiebreakPoints(prediction, result);
  }

  function feedbackLabel(points, isExact = false) {
    if(isExact) return 'Na mosca';
    if(points === 25) return 'Quase crava';
    if(points === 0) return 'Que azar';
    if(points > 0) return 'Quase crava';
    return 'Aguardando';
  }

  function feedbackText(result, points, prediction) {
    if(!result || result.a === '' || result.b === '') return 'Resultado: pendente';
    if(points === null) return `Resultado: ${result.a}:${result.b} - aguardando palpite`;
    return `Resultado: ${result.a}:${result.b} - ${points} pontos · ${feedbackLabel(points, exactMainScore(prediction, result))}`;
  }

  function createLockService({scoreComplete, lockMinutes = 60, defaultKickoffHour = 12, year = 2026}) {
    function matchKickoffDate(dateLabel) {
      if(!dateLabel) return null;
      const months = {jan:0, fev:1, mar:2, abr:3, mai:4, jun:5, jul:6, ago:7, set:8, out:9, nov:10, dez:11};
      const dateMatch = dateLabel.toLowerCase().match(/(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/);
      if(!dateMatch) return null;
      const day = Number(dateMatch[1]);
      const month = months[dateMatch[2]];
      if(!day || month === undefined) return null;
      const timeMatch = dateLabel.match(/(\d{1,2}):(\d{2})\s*BRT/i);
      if(timeMatch) {
        const hour = Number(timeMatch[1]);
        const minute = Number(timeMatch[2]);
        return new Date(Date.UTC(year, month, day, hour + 3, minute, 0, 0));
      }
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

    function groupExactCount(user, state) {
      const predictions = (state.predictions || {})[user] || {};
      return groups.reduce((sum, group) => {
        return sum + matches[group].reduce((groupSum, pair, index) => {
          const key = `${group}${index + 1}`;
          return groupSum + exactCount(predictions[key], state.scores[key]);
        }, 0);
      }, 0);
    }

    function knockoutExactCount(user, state) {
      const predictions = (state.knockoutPredictions || {})[user] || {};
      return knockoutMatches.reduce((sum, match) => {
        return sum + exactCount(predictions[match.id], state.knockoutScores[match.id]);
      }, 0);
    }

    return {
      groupTotal,
      knockoutTotal,
      groupExactCount,
      knockoutExactCount
    };
  }

  window.PredictionService = {
    resultSign,
    predictionPoints,
    exactCount,
    feedbackLabel,
    feedbackText,
    createLockService,
    createScoreService
  };
})();
