const fs = require("fs");
const path = require("path");

const API_BASE_URL = "https://api.football-data.org/v4";
const COMPETITION = "WC";
const SEASON = 2026;
const DAILY_LIMIT = 50;
const INFO_TTL_MS = 24 * 60 * 60 * 1000;
const RANKINGS_TTL_MS = 60 * 60 * 1000;
const FIXTURES_TTL_MS = 60 * 60 * 1000;
const STANDINGS_TTL_MS = 60 * 60 * 1000;
const LIVE_TTL_MS = 2 * 60 * 1000;
const OUT_FILE = path.resolve(__dirname, "..", "js", "data", "apiStats.json");

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readCurrent() {
  if (!fs.existsSync(OUT_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  } catch (error) {
    return {};
  }
}

function writePayload(payload) {
  fs.mkdirSync(path.dirname(OUT_FILE), {recursive: true});
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
}

function normalize(current) {
  const day = todayKey();
  const meta = current.meta || {};
  return {
    payload: {
      leagues: current.leagues || [],
      teams: current.teams || [],
      topScorers: current.topScorers || [],
      topAssists: current.topAssists || [],
      topYellowCards: current.topYellowCards || [],
      topRedCards: current.topRedCards || [],
      fixtures: current.fixtures || [],
      standings: current.standings || [],
      liveFixtures: current.liveFixtures || [],
    },
    meta: {
      day,
      provider: "football-data.org",
      infoFetchedAt: Number(meta.infoFetchedAt) || 0,
      rankingsFetchedAt: Number(meta.rankingsFetchedAt) || 0,
      fixturesFetchedAt: Number(meta.fixturesFetchedAt) || 0,
      standingsFetchedAt: Number(meta.standingsFetchedAt) || 0,
      liveFetchedAt: Number(meta.liveFetchedAt) || 0,
      requestCount: meta.day === day ? Number(meta.requestCount) || 0 : 0,
      dailyLimit: DAILY_LIMIT,
      generatedAt: Number(meta.generatedAt) || 0,
    },
  };
}

function isFresh(fetchedAt, ttl) {
  return Boolean(fetchedAt && Date.now() - Number(fetchedAt) < ttl);
}

function canRequest(meta, amount = 1) {
  return meta.requestCount + amount <= DAILY_LIMIT;
}

function normalizeName(value) {
  return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
}

async function apiGet(pathname, params, token, extraHeaders = {}) {
  const query = new URLSearchParams(params);
  const suffix = query.toString() ? `?${query}` : "";
  const response = await fetch(`${API_BASE_URL}${pathname}${suffix}`, {
    headers: {"X-Auth-Token": token, ...extraHeaders},
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`football-data ${pathname}: resposta invalida (${response.status})`);
  }
  if (!response.ok) {
    const error = new Error(`football-data ${pathname}: ${data.message || response.status}`);
    error.status = response.status;
    throw error;
  }
  if (data.error || data.message && data.statusCode) {
    throw new Error(`football-data ${pathname}: ${data.message || data.error}`);
  }
  return data;
}

function statusShort(status) {
  const map = {
    SCHEDULED: "NS",
    TIMED: "NS",
    IN_PLAY: "LIVE",
    PAUSED: "HT",
    FINISHED: "FT",
    SUSPENDED: "SUSP",
    POSTPONED: "PST",
    CANCELLED: "CANC",
    AWARDED: "AWD",
  };
  return map[status] || status || "NS";
}

function normalizeFixture(match) {
  const fullTime = match.score?.fullTime || {};
  return {
    fixture: {
      id: match.id,
      date: match.utcDate,
      status: {
        short: statusShort(match.status),
        long: match.status || "",
        elapsed: match.minute ? Number(match.minute) : null,
      },
    },
    league: {
      id: 2000,
      name: "FIFA World Cup",
      season: SEASON,
      round: match.stage || match.group || "",
    },
    teams: {
      home: {id: match.homeTeam?.id, name: match.homeTeam?.name},
      away: {id: match.awayTeam?.id, name: match.awayTeam?.name},
    },
    goals: {
      home: fullTime.home,
      away: fullTime.away,
    },
    bookings: match.bookings || [],
  };
}

function bookingTeamName(booking) {
  return booking.team?.name ||
      booking.team?.shortName ||
      booking.teamName ||
      booking.team ||
      "";
}

function bookingCardType(booking) {
  return normalizeName(booking.card || booking.type || booking.cardType || "");
}

function buildTeamCardRows(matches) {
  const rows = {};
  (matches || []).forEach((match) => {
    (match.bookings || []).forEach((booking) => {
      const team = bookingTeamName(booking);
      if (!team) return;
      rows[team] = rows[team] || {team, yellow: 0, red: 0, total: 0};
      const type = bookingCardType(booking);
      if (type.includes("yellow") && !type.includes("red")) {
        rows[team].yellow += 1;
        rows[team].total += 1;
        return;
      }
      if (type.includes("red")) {
        rows[team].red += 1;
        rows[team].total += 1;
      }
    });
  });

  return Object.values(rows)
      .map((row) => ({
        player: {name: row.team},
        team: row.team,
        name: row.team,
        yellow: row.yellow,
        red: row.red,
        statistics: [{
          team: {name: row.team},
          cards: {yellow: row.yellow, red: row.red},
        }],
      }))
      .sort((a, b) => {
        const totalA = Number(a.yellow) + Number(a.red);
        const totalB = Number(b.yellow) + Number(b.red);
        return totalB - totalA || Number(b.red) - Number(a.red) || a.team.localeCompare(b.team);
      });
}

function normalizeScorer(row) {
  return {
    player: {id: row.player?.id, name: row.player?.name},
    team: row.team?.name,
    name: row.player?.name,
    goals: Number(row.goals) || 0,
    assists: Number(row.assists) || 0,
    statistics: [{
      team: {id: row.team?.id, name: row.team?.name},
      goals: {
        total: Number(row.goals) || 0,
        assists: Number(row.assists) || 0,
      },
      cards: {yellow: 0, red: 0},
    }],
  };
}

function normalizeStandings(data) {
  const groups = data.standings || [];
  return [{
    league: {
      id: 2000,
      name: data.competition?.name || "FIFA World Cup",
      season: SEASON,
      standings: groups.map((group) => {
        return (group.table || []).map((row) => ({
          rank: row.position,
          team: {
            id: row.team?.id,
            name: row.team?.name,
            logo: row.team?.crest,
          },
          points: Number(row.points) || 0,
          goalsDiff: Number(row.goalDifference) || 0,
          group: group.group || group.stage || "",
          all: {
            played: Number(row.playedGames) || 0,
            win: Number(row.won) || 0,
            draw: Number(row.draw) || 0,
            lose: Number(row.lost) || 0,
            goals: {
              for: Number(row.goalsFor) || 0,
              against: Number(row.goalsAgainst) || 0,
            },
          },
        }));
      }),
    },
  }];
}

async function refreshInfo(state, token) {
  if (isFresh(state.meta.infoFetchedAt, INFO_TTL_MS)) return;
  if (!canRequest(state.meta, 2)) return;

  const competition = await apiGet(`/competitions/${COMPETITION}`, {}, token);
  state.meta.requestCount += 1;
  state.payload.leagues = [competition];

  const teams = await apiGet(`/competitions/${COMPETITION}/teams`, {
    season: String(SEASON),
  }, token);
  state.meta.requestCount += 1;
  state.payload.teams = teams.teams || [];
  state.meta.infoFetchedAt = Date.now();
}

async function refreshRankings(state, token) {
  if (isFresh(state.meta.rankingsFetchedAt, RANKINGS_TTL_MS)) return;
  if (!canRequest(state.meta)) return;

  let data = {};
  try {
    data = await apiGet(`/competitions/${COMPETITION}/scorers`, {
      season: String(SEASON),
      limit: "100",
    }, token);
    state.meta.requestCount += 1;
  } catch (error) {
    if (error.status !== 404) throw error;
    state.meta.requestCount += 1;
  }
  const scorers = (data.scorers || []).map(normalizeScorer);
  state.payload.topScorers = scorers.slice().sort((a, b) => b.goals - a.goals);
  state.payload.topAssists = scorers
      .filter((row) => row.assists > 0)
      .sort((a, b) => b.assists - a.assists || b.goals - a.goals);
  state.meta.rankingsFetchedAt = Date.now();
}

async function refreshFixtures(state, token) {
  if (isFresh(state.meta.fixturesFetchedAt, FIXTURES_TTL_MS)) return;
  if (!canRequest(state.meta)) return;

  const data = await apiGet(`/competitions/${COMPETITION}/matches`, {
    season: String(SEASON),
  }, token, {"X-Unfold-Bookings": "true"});
  state.meta.requestCount += 1;
  const matches = data.matches || [];
  const cardRows = buildTeamCardRows(matches);
  state.payload.fixtures = matches.map(normalizeFixture);
  state.payload.topYellowCards = cardRows.filter((row) => Number(row.yellow) > 0);
  state.payload.topRedCards = cardRows.filter((row) => Number(row.red) > 0);
  state.meta.fixturesFetchedAt = Date.now();
}

async function refreshStandings(state, token) {
  if (isFresh(state.meta.standingsFetchedAt, STANDINGS_TTL_MS)) return;
  if (!canRequest(state.meta)) return;

  try {
    const data = await apiGet(`/competitions/${COMPETITION}/standings`, {
      season: String(SEASON),
    }, token);
    state.payload.standings = normalizeStandings(data);
  } catch (error) {
    if (error.status !== 404) throw error;
    state.payload.standings = [];
  }
  state.meta.requestCount += 1;
  state.meta.standingsFetchedAt = Date.now();
}

async function refreshLive(state, token) {
  if (isFresh(state.meta.liveFetchedAt, LIVE_TTL_MS)) return;
  if (!canRequest(state.meta)) return;

  const data = await apiGet(`/competitions/${COMPETITION}/matches`, {
    season: String(SEASON),
    status: "IN_PLAY,PAUSED",
  }, token);
  state.meta.requestCount += 1;
  state.payload.liveFixtures = (data.matches || []).map(normalizeFixture);
  state.meta.liveFetchedAt = Date.now();
}

function nextRefreshAt(meta) {
  return Math.min(
      Number(meta.infoFetchedAt || Date.now()) + INFO_TTL_MS,
      Number(meta.rankingsFetchedAt || Date.now()) + RANKINGS_TTL_MS,
      Number(meta.fixturesFetchedAt || Date.now()) + FIXTURES_TTL_MS,
      Number(meta.standingsFetchedAt || Date.now()) + STANDINGS_TTL_MS,
      Number(meta.liveFetchedAt || Date.now()) + LIVE_TTL_MS,
  );
}

function output(state, warning = "") {
  const fetchedAt = Math.max(
      Number(state.meta.infoFetchedAt) || 0,
      Number(state.meta.rankingsFetchedAt) || 0,
      Number(state.meta.fixturesFetchedAt) || 0,
      Number(state.meta.standingsFetchedAt) || 0,
      Number(state.meta.liveFetchedAt) || 0,
  );
  return {
    ...state.payload,
    meta: {
      ...state.meta,
      fetchedAt,
      nextRefreshAt: nextRefreshAt(state.meta),
      warning,
      generatedAt: state.meta.generatedAt || 0,
    },
  };
}

function withoutGeneratedAt(payload) {
  return {
    ...payload,
    meta: {...(payload.meta || {}), generatedAt: 0},
  };
}

function writeIfChanged(current, next) {
  const currentComparable = JSON.stringify(withoutGeneratedAt(current || {}));
  const nextComparable = JSON.stringify(withoutGeneratedAt(next));
  if (currentComparable === nextComparable) {
    console.log("Football stats unchanged.");
    return;
  }
  next.meta.generatedAt = Date.now();
  writePayload(next);
}

function statsSummary(payload) {
  return {
    provider: payload.meta?.provider,
    leagues: (payload.leagues || []).length,
    teams: (payload.teams || []).length,
    topScorers: (payload.topScorers || []).length,
    topAssists: (payload.topAssists || []).length,
    topYellowCards: (payload.topYellowCards || []).length,
    topRedCards: (payload.topRedCards || []).length,
    fixtures: (payload.fixtures || []).length,
    standings: (payload.standings || []).length,
    liveFixtures: (payload.liveFixtures || []).length,
  };
}

async function main() {
  const current = readCurrent();
  const state = normalize(current);
  const token = String(
      process.env.FOOTBALL_DATA_TOKEN || "",
  ).trim();

  if (!token) {
    if (process.env.GITHUB_ACTIONS) {
      throw new Error("Configure FOOTBALL_DATA_TOKEN nos Secrets do GitHub Actions.");
    }
    writeIfChanged(current, output(state, "FOOTBALL_DATA_TOKEN ausente; dados mantidos"));
    return;
  }

  await refreshInfo(state, token);
  await refreshRankings(state, token);
  await refreshFixtures(state, token);
  await refreshStandings(state, token);
  await refreshLive(state, token);
  const next = output(state);
  console.log("Football stats summary:", statsSummary(next));
  writeIfChanged(current, next);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
