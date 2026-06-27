(function () {
  function createKnockoutService({matches, standingsService, scoreComplete}) {
    function placeholderForSpec(spec) {
      if(spec.type === 'group') return `${spec.pos}º Grupo ${spec.group}`;
      if(spec.type === 'third') return `3º ${spec.groups.join('/')}`;
      if(spec.type === 'winner') return `Vencedor J${spec.match}`;
      if(spec.type === 'loser') return `Perdedor J${spec.match}`;
      return 'A definir';
    }

    function knockoutMatch(id) {
      return matches.find(match => match.id === id);
    }

    function resolveSpec(spec, groupScores, knockoutScores) {
      if(spec.type === 'group') {
        if(!standingsService.groupComplete(spec.group, groupScores)) return placeholderForSpec(spec);
        return standingsService.groupStanding(spec.group, groupScores)[spec.pos - 1]?.team || placeholderForSpec(spec);
      }
      if(spec.type === 'third') {
        const candidates = standingsService.thirdPlaceRank(groupScores).filter(row => spec.groups.includes(row.group));
        return candidates.length === 1 ? candidates[0].team : placeholderForSpec(spec);
      }
      if(spec.type === 'winner') return knockoutResult(spec.match, 'winner', groupScores, knockoutScores) || placeholderForSpec(spec);
      if(spec.type === 'loser') return knockoutResult(spec.match, 'loser', groupScores, knockoutScores) || placeholderForSpec(spec);
      return 'A definir';
    }

    function knockoutResult(id, type, groupScores, knockoutScores) {
      const match = knockoutMatch(id);
      const score = knockoutScores[id];
      if(!match || !scoreComplete(score)) return null;
      const teamA = resolveSpec(match.a, groupScores, knockoutScores);
      const teamB = resolveSpec(match.b, groupScores, knockoutScores);
      const winnerSide = winnerFromScore(score);
      if(!winnerSide) return null;
      return winnerSide === 'a'
        ? (type === 'winner' ? teamA : teamB)
        : (type === 'winner' ? teamB : teamA);
    }

    function winnerFromScore(score) {
      if(Number(score.a) > Number(score.b)) return 'a';
      if(Number(score.b) > Number(score.a)) return 'b';
      if(score.eta !== '' && score.etb !== '') {
        if(Number(score.eta) > Number(score.etb)) return 'a';
        if(Number(score.etb) > Number(score.eta)) return 'b';
      }
      if(score.eta !== '' && score.etb !== '' && Number(score.eta) === Number(score.etb) && score.pena !== '' && score.penb !== '') {
        if(Number(score.pena) > Number(score.penb)) return 'a';
        if(Number(score.penb) > Number(score.pena)) return 'b';
      }
      return null;
    }

    return {
      placeholderForSpec,
      knockoutMatch,
      resolveSpec,
      knockoutResult
    };
  }

  window.KnockoutService = {
    create: createKnockoutService
  };
})();
