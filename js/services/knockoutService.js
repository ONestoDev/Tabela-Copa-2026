(function () {
  function createKnockoutService({matches, standingsService, scoreComplete, thirdPlaceHosts = [], thirdPlaceCombinations = {}}) {
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
        if(!standingsService.groupHasScores(spec.group, groupScores)) return placeholderForSpec(spec);
        return standingsService.groupStanding(spec.group, groupScores)[spec.pos - 1]?.team || placeholderForSpec(spec);
      }
      if(spec.type === 'third') {
        return thirdPlaceAllocations(groupScores).get(spec)?.team || placeholderForSpec(spec);
      }
      if(spec.type === 'winner') return knockoutResult(spec.match, 'winner', groupScores, knockoutScores) || placeholderForSpec(spec);
      if(spec.type === 'loser') return knockoutResult(spec.match, 'loser', groupScores, knockoutScores) || placeholderForSpec(spec);
      return 'A definir';
    }

    function thirdPlaceSlots() {
      const slots = [];
      matches.forEach(match => {
        ['a', 'b'].forEach(side => {
          if(match[side]?.type === 'third') slots.push({host: match.thirdHost, spec: match[side]});
        });
      });
      return slots;
    }

    function thirdPlaceAllocations(groupScores) {
      const slots = thirdPlaceSlots();
      const candidates = standingsService.thirdPlaceRank(groupScores);
      const qualifiedGroups = candidates.map(row => row.group).sort().join('');
      const combination = thirdPlaceCombinations[qualifiedGroups];
      const usedGroups = new Set();
      const allocations = new Map();

      if(combination) {
        thirdPlaceHosts.forEach((host, index) => {
          const group = combination[index];
          const slot = slots.find(item => item.host === host);
          const candidate = candidates.find(row => row.group === group);
          if(slot && candidate) allocations.set(slot.spec, candidate);
        });
        return allocations;
      }

      slots.forEach(slot => {
        const candidate = candidates.find(row => !usedGroups.has(row.group) && slot.spec.groups.includes(row.group));
        if(!candidate) return;
        usedGroups.add(candidate.group);
        allocations.set(slot.spec, candidate);
      });

      return allocations;
    }

    function knockoutScoreComplete(score) {
      if(!score || score.a === '' || score.b === '') return false;
      if(Number(score.a) !== Number(score.b)) return true;
      if(score.eta === undefined || score.etb === undefined || score.eta === '' || score.etb === '') return false;
      if(Number(score.eta) !== Number(score.etb)) return true;
      return score.pena !== undefined && score.penb !== undefined &&
        score.pena !== '' && score.penb !== '' &&
        Number(score.pena) !== Number(score.penb);
    }

    function winnerFromScore(score) {
      if(!knockoutScoreComplete(score)) return null;
      if(Number(score.a) > Number(score.b)) return 'a';
      if(Number(score.b) > Number(score.a)) return 'b';
      if(Number(score.eta) > Number(score.etb)) return 'a';
      if(Number(score.etb) > Number(score.eta)) return 'b';
      if(Number(score.pena) > Number(score.penb)) return 'a';
      if(Number(score.penb) > Number(score.pena)) return 'b';
      return null;
    }

    function knockoutWinnerClass(score, side) {
      return winnerFromScore(score) === side ? ' winner' : '';
    }

    function knockoutResult(id, type, groupScores, knockoutScores) {
      const match = knockoutMatch(id);
      const score = knockoutScores[id];
      if(!match || !knockoutScoreComplete(score)) return null;
      const teamA = resolveSpec(match.a, groupScores, knockoutScores);
      const teamB = resolveSpec(match.b, groupScores, knockoutScores);
      const winnerSide = winnerFromScore(score);
      if(!winnerSide) return null;
      return winnerSide === 'a'
        ? (type === 'winner' ? teamA : teamB)
        : (type === 'winner' ? teamB : teamA);
    }

    return {
      placeholderForSpec,
      knockoutMatch,
      resolveSpec,
      knockoutResult,
      thirdPlaceAllocations,
      knockoutScoreComplete,
      winnerFromScore,
      knockoutWinnerClass
    };
  }

  window.KnockoutService = {
    create: createKnockoutService
  };
})();
