(function () {
  function createUiHelpers({teams, countryCodes}) {
    function getTeamName(slot) {
      const group = slot.charAt(0);
      const pos = parseInt(slot.charAt(1), 10) - 1;
      return teams[group]?.[pos] || slot;
    }

    function getCountryCode(teamName) {
      return countryCodes[teamName] || 'XX';
    }

    function getFlagUrl(teamName) {
      const code = getCountryCode(teamName);
      return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
      }[char]));
    }

    function scoreComplete(score) {
      return score && score.a !== '' && score.b !== '';
    }

    function matchStateClass(score) {
      return scoreComplete(score) ? 'is-played' : 'is-pending';
    }

    function predictionStateClass(points) {
      if(points === 50) return 'is-exact';
      if(points === 25) return 'is-partial';
      if(points === 0) return 'is-missed';
      return 'is-pending';
    }

    function winnerClass(score, side) {
      if(!scoreComplete(score) || Number(score.a) === Number(score.b)) return '';
      return (side === 'a' && Number(score.a) > Number(score.b)) || (side === 'b' && Number(score.b) > Number(score.a)) ? ' winner' : '';
    }

    return {
      getTeamName,
      getCountryCode,
      getFlagUrl,
      escapeHtml,
      scoreComplete,
      matchStateClass,
      predictionStateClass,
      winnerClass
    };
  }

  window.UiHelpers = {
    create: createUiHelpers
  };
})();
