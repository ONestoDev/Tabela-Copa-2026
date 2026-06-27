(function () {
  const TEAMS = {
    A: ['México', 'África do Sul', 'Coreia do Sul', 'República Tcheca'],
    B: ['Canadá', 'Bósnia e Herzegovina', 'Catar', 'Suíça'],
    C: ['Brasil', 'Marrocos', 'Haiti', 'Escócia'],
    D: ['Estados Unidos', 'Paraguai', 'Austrália', 'Turquia'],
    E: ['Alemanha', 'Curaçao', 'Costa do Marfim', 'Equador'],
    F: ['Holanda', 'Japão', 'Suécia', 'Tunísia'],
    G: ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
    H: ['Espanha', 'Cabo Verde', 'Arábia Saudita', 'Uruguai'],
    I: ['França', 'Senegal', 'Iraque', 'Noruega'],
    J: ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
    K: ['Portugal', 'República Democrática do Congo', 'Uzbequistão', 'Colômbia'],
    L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá']
  };

  const COUNTRY_CODES = {
    'México': 'MX', 'África do Sul': 'ZA', 'Coreia do Sul': 'KR', 'República Tcheca': 'CZ',
    'Canadá': 'CA', 'Bósnia e Herzegovina': 'BA', 'Catar': 'QA', 'Suíça': 'CH',
    'Brasil': 'BR', 'Marrocos': 'MA', 'Haiti': 'HT', 'Escócia': 'GB',
    'Estados Unidos': 'US', 'Paraguai': 'PY', 'Austrália': 'AU', 'Turquia': 'TR',
    'Alemanha': 'DE', 'Curaçao': 'CW', 'Costa do Marfim': 'CI', 'Equador': 'EC',
    'Holanda': 'NL', 'Japão': 'JP', 'Suécia': 'SE', 'Tunísia': 'TN',
    'Bélgica': 'BE', 'Egito': 'EG', 'Irã': 'IR', 'Nova Zelândia': 'NZ',
    'Espanha': 'ES', 'Cabo Verde': 'CV', 'Arábia Saudita': 'SA', 'Uruguai': 'UY',
    'França': 'FR', 'Senegal': 'SN', 'Iraque': 'IQ', 'Noruega': 'NO',
    'Argentina': 'AR', 'Argélia': 'DZ', 'Áustria': 'AT', 'Jordânia': 'JO',
    'Portugal': 'PT', 'República Democrática do Congo': 'CD', 'Uzbequistão': 'UZ', 'Colômbia': 'CO',
    'Inglaterra': 'GB', 'Croácia': 'HR', 'Gana': 'GH', 'Panamá': 'PA'
  };

  const GROUPS = 'ABCDEFGHIJKL'.split('');

  const matches = {
    A: [['A1','A2'], ['A3','A4'], ['A1','A3'], ['A4','A2'], ['A4','A1'], ['A2','A3']],
    B: [['B1','B2'], ['B3','B4'], ['B1','B3'], ['B4','B2'], ['B4','B1'], ['B2','B3']],
    C: [['C1','C2'], ['C3','C4'], ['C1','C3'], ['C4','C2'], ['C4','C1'], ['C2','C3']],
    D: [['D1','D2'], ['D3','D4'], ['D1','D3'], ['D4','D2'], ['D4','D1'], ['D2','D3']],
    E: [['E1','E2'], ['E3','E4'], ['E1','E3'], ['E4','E2'], ['E4','E1'], ['E2','E3']],
    F: [['F1','F2'], ['F3','F4'], ['F1','F3'], ['F4','F2'], ['F4','F1'], ['F2','F3']],
    G: [['G1','G2'], ['G3','G4'], ['G1','G3'], ['G4','G2'], ['G4','G1'], ['G2','G3']],
    H: [['H1','H2'], ['H3','H4'], ['H1','H3'], ['H4','H2'], ['H4','H1'], ['H2','H3']],
    I: [['I1','I2'], ['I3','I4'], ['I1','I3'], ['I4','I2'], ['I4','I1'], ['I2','I3']],
    J: [['J1','J2'], ['J3','J4'], ['J1','J3'], ['J4','J2'], ['J4','J1'], ['J2','J3']],
    K: [['K1','K2'], ['K3','K4'], ['K1','K3'], ['K4','K2'], ['K4','K1'], ['K2','K3']],
    L: [['L1','L2'], ['L3','L4'], ['L1','L3'], ['L4','L2'], ['L4','L1'], ['L2','L3']]
  };

  const matchDates = {
    A: ['11 jun', '11 jun', '18 jun', '18 jun', '24 jun', '24 jun'],
    B: ['12 jun', '13 jun', '18 jun', '18 jun', '24 jun', '24 jun'],
    C: ['13 jun', '13 jun', '19 jun', '19 jun', '24 jun', '24 jun'],
    D: ['12 jun', '13 jun', '19 jun', '19 jun', '25 jun', '25 jun'],
    E: ['14 jun', '14 jun', '20 jun', '20 jun', '25 jun', '25 jun'],
    F: ['14 jun', '14 jun', '20 jun', '20 jun', '25 jun', '25 jun'],
    G: ['15 jun', '15 jun', '21 jun', '21 jun', '26 jun', '26 jun'],
    H: ['15 jun', '15 jun', '21 jun', '21 jun', '26 jun', '26 jun'],
    I: ['16 jun', '16 jun', '22 jun', '22 jun', '26 jun', '26 jun'],
    J: ['16 jun', '17 jun', '22 jun', '22 jun', '27 jun', '27 jun'],
    K: ['17 jun', '17 jun', '23 jun', '23 jun', '27 jun', '27 jun'],
    L: ['17 jun', '18 jun', '23 jun', '23 jun', '27 jun', '27 jun']
  };

  const RESULT_PHASES = [
    {value:'all', label:'Todos os resultados'},
    {value:'group-1', label:'Rodada 1'},
    {value:'group-2', label:'Rodada 2'},
    {value:'group-3', label:'Rodada 3'},
    {value:'r32', label:'16 avos de final'},
    {value:'r16', label:'Oitavas de final'},
    {value:'qf', label:'Quartas de final'},
    {value:'sf', label:'Semifinais'},
    {value:'third', label:'Disputa de 3º lugar'},
    {value:'final', label:'Final'}
  ];

  const KNOCKOUT_MATCHES = [
    {id:73, phase:'r32', label:'16 avos', a:{type:'group', group:'A', pos:2}, b:{type:'group', group:'B', pos:2}},
    {id:74, phase:'r32', label:'16 avos', a:{type:'group', group:'E', pos:1}, b:{type:'third', groups:['A','B','C','D','F']}},
    {id:75, phase:'r32', label:'16 avos', a:{type:'group', group:'F', pos:1}, b:{type:'group', group:'C', pos:2}},
    {id:76, phase:'r32', label:'16 avos', a:{type:'group', group:'C', pos:1}, b:{type:'group', group:'F', pos:2}},
    {id:77, phase:'r32', label:'16 avos', a:{type:'group', group:'I', pos:1}, b:{type:'third', groups:['C','D','F','G','H']}},
    {id:78, phase:'r32', label:'16 avos', a:{type:'group', group:'E', pos:2}, b:{type:'group', group:'I', pos:2}},
    {id:79, phase:'r32', label:'16 avos', a:{type:'group', group:'A', pos:1}, b:{type:'third', groups:['C','E','F','H','I']}},
    {id:80, phase:'r32', label:'16 avos', a:{type:'group', group:'L', pos:1}, b:{type:'third', groups:['E','H','I','J','K']}},
    {id:81, phase:'r32', label:'16 avos', a:{type:'group', group:'D', pos:1}, b:{type:'third', groups:['B','E','F','I','J']}},
    {id:82, phase:'r32', label:'16 avos', a:{type:'group', group:'G', pos:1}, b:{type:'third', groups:['A','E','H','I','J']}},
    {id:83, phase:'r32', label:'16 avos', a:{type:'group', group:'K', pos:2}, b:{type:'group', group:'L', pos:2}},
    {id:84, phase:'r32', label:'16 avos', a:{type:'group', group:'H', pos:1}, b:{type:'group', group:'J', pos:2}},
    {id:85, phase:'r32', label:'16 avos', a:{type:'group', group:'B', pos:1}, b:{type:'third', groups:['E','F','G','I','J']}},
    {id:86, phase:'r32', label:'16 avos', a:{type:'group', group:'J', pos:1}, b:{type:'group', group:'H', pos:2}},
    {id:87, phase:'r32', label:'16 avos', a:{type:'group', group:'K', pos:1}, b:{type:'third', groups:['D','E','I','J','L']}},
    {id:88, phase:'r32', label:'16 avos', a:{type:'group', group:'D', pos:2}, b:{type:'group', group:'G', pos:2}},
    {id:89, phase:'r16', label:'Oitavas', a:{type:'winner', match:73}, b:{type:'winner', match:75}},
    {id:90, phase:'r16', label:'Oitavas', a:{type:'winner', match:74}, b:{type:'winner', match:77}},
    {id:91, phase:'r16', label:'Oitavas', a:{type:'winner', match:76}, b:{type:'winner', match:78}},
    {id:92, phase:'r16', label:'Oitavas', a:{type:'winner', match:79}, b:{type:'winner', match:80}},
    {id:93, phase:'r16', label:'Oitavas', a:{type:'winner', match:83}, b:{type:'winner', match:84}},
    {id:94, phase:'r16', label:'Oitavas', a:{type:'winner', match:81}, b:{type:'winner', match:82}},
    {id:95, phase:'r16', label:'Oitavas', a:{type:'winner', match:86}, b:{type:'winner', match:88}},
    {id:96, phase:'r16', label:'Oitavas', a:{type:'winner', match:85}, b:{type:'winner', match:87}},
    {id:97, phase:'qf', label:'Quartas', a:{type:'winner', match:89}, b:{type:'winner', match:90}},
    {id:98, phase:'qf', label:'Quartas', a:{type:'winner', match:93}, b:{type:'winner', match:94}},
    {id:99, phase:'qf', label:'Quartas', a:{type:'winner', match:91}, b:{type:'winner', match:92}},
    {id:100, phase:'qf', label:'Quartas', a:{type:'winner', match:95}, b:{type:'winner', match:96}},
    {id:101, phase:'sf', label:'Semifinais', a:{type:'winner', match:97}, b:{type:'winner', match:98}},
    {id:102, phase:'sf', label:'Semifinais', a:{type:'winner', match:99}, b:{type:'winner', match:100}},
    {id:103, phase:'third', label:'3º lugar', a:{type:'loser', match:101}, b:{type:'loser', match:102}},
    {id:104, phase:'final', label:'Final', a:{type:'winner', match:101}, b:{type:'winner', match:102}}
  ];

  const KNOCKOUT_PHASES = [
    {value:'r32', label:'16 avos de final'},
    {value:'r16', label:'Oitavas de final'},
    {value:'qf', label:'Quartas de final'},
    {value:'sf', label:'Semifinais'},
    {value:'third', label:'Disputa de 3º lugar'},
    {value:'final', label:'Final'}
  ];

  window.WorldCupData = {
    TEAMS,
    COUNTRY_CODES,
    GROUPS,
    matches,
    matchDates,
    RESULT_PHASES,
    KNOCKOUT_MATCHES,
    KNOCKOUT_PHASES
  };
})();
