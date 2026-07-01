# Arquitetura futura

Este projeto nasceu com a Copa do Mundo 2026, mas o conceito pode escalar para outros campeonatos: Champions League, Libertadores, Mundial de Clubes, Copa do Mundo Feminina e outros torneios com fase de grupos, mata-mata, palpites e estatisticas.

## Objetivo

Manter uma base comum de aplicacao para varios campeonatos, evitando criar um projeto separado para cada torneio.

O app deve conseguir:

- listar campeonatos disponiveis;
- abrir uma temporada especifica;
- registrar resultados oficiais;
- permitir palpites por usuario;
- calcular classificacao, mata-mata, rankings e estatisticas;
- reaproveitar componentes de tela e regras de pontuacao.

## Modelo atual

Hoje o app salva quase tudo em um documento compartilhado:

```txt
copa2026Storage/shared-state
```

Esse modelo e simples e funciona para validar o produto, mas nao escala bem porque:

- todos os usuarios escrevem no mesmo documento;
- um erro pode sobrescrever dados de outro usuario;
- placares oficiais e palpites ficam misturados;
- regras de seguranca ficam limitadas;
- fica dificil adicionar outros campeonatos sem aumentar muito o estado global.

## Modelo futuro recomendado

Separar dados por campeonato, temporada e usuario.

```txt
tournaments/{tournamentId}
  name
  slug
  type
  activeSeasonId
  createdAt
  updatedAt

tournaments/{tournamentId}/seasons/{seasonId}
  name
  year
  status
  config
  createdAt
  updatedAt

tournaments/{tournamentId}/seasons/{seasonId}/official/state
  scores
  knockoutScores
  standingsConfig
  updatedAt
  updatedBy

tournaments/{tournamentId}/seasons/{seasonId}/predictions/{uid}
  displayName
  groupPredictions
  knockoutPredictions
  updatedAt

tournaments/{tournamentId}/seasons/{seasonId}/users/{uid}
  displayName
  role
  joinedAt
  updatedAt

tournaments/{tournamentId}/seasons/{seasonId}/leaderboards/group
  rows
  updatedAt

tournaments/{tournamentId}/seasons/{seasonId}/leaderboards/knockout
  rows
  updatedAt

tournaments/{tournamentId}/seasons/{seasonId}/leaderboards/overall
  rows
  updatedAt
```

## IDs sugeridos

Usar slugs estaveis:

```txt
world-cup
champions-league
libertadores
club-world-cup
womens-world-cup
```

Temporadas:

```txt
2026
2025-26
2027
```

Exemplos:

```txt
tournaments/world-cup/seasons/2026
tournaments/champions-league/seasons/2025-26
tournaments/libertadores/seasons/2026
```

## Regras de escrita

Separar responsabilidades:

- leitura publica para torneios, jogos, rankings e placares;
- escrita de resultados oficiais apenas para admin;
- escrita de palpite apenas pelo proprio usuario;
- rankings podem ser recalculados no cliente inicialmente;
- no futuro, rankings podem ser materializados por Cloud Functions ou processo admin.

## Autenticacao futura

A autenticacao pode entrar depois, sem bloquear a evolucao atual.

Fluxo recomendado:

1. Usuario entra com Google ou e-mail.
2. O app recebe `uid` do Firebase Authentication.
3. Palpites passam a ser salvos em `predictions/{uid}`.
4. Admin recebe permissao `admin: true`.
5. Apenas admin pode alterar `official/state`.

## Migracao do modelo atual

Quando chegar a hora de migrar:

1. Ler `copa2026Storage/shared-state`.
2. Criar `tournaments/world-cup/seasons/2026/official/state`.
3. Mover `scores` e `knockoutScores` para o estado oficial.
4. Para cada usuario em `users`, criar um documento em `predictions/{uid}` ou em uma area temporaria baseada no nome.
5. Manter o app lendo o modelo antigo como fallback por um periodo curto.

## Ordem recomendada de evolucao

1. Manter Firestore atual ate estabilizar o projeto da Copa 2026.
2. Extrair configuracao de campeonato para arquivos de dados reutilizaveis.
3. Criar seletor de campeonato/temporada.
4. Separar placares oficiais e palpites no estado interno.
5. Adicionar Firebase Authentication.
6. Migrar Firestore para colecoes por campeonato e temporada.
7. Adicionar regras de producao.
8. Adicionar estatisticas avancadas.

