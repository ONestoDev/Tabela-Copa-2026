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

  window.PredictionService = {
    resultSign,
    predictionPoints
  };
})();
