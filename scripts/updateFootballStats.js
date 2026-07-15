const fs = require("fs");
const path = require("path");

const API_HOST = "v3.football.api-sports.io";
const API_BASE_URL = `https://${API_HOST}`;
const LEAGUE_ID = 1;
const SEASON = 2026;
const DAILY_LIMIT = 50;
const INFO_TTL_MS = 24 * 60 * 60 * 1000;
const RANKINGS_TTL_MS = 24 * 60 * 60 * 1000;
const FIXTURES_TTL_MS = 60 * 60 * 1000;
const STANDINGS_TTL_MS = 60 * 60 * 1000;
const LIVE_TTL_MS = 2 * 60 * 1000;
const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;
const OUT_FILE = path.resolve(__dirname, "..", "js", "data", "apiStats.json");

const RANKING_ENDPOINTS = [
  {key: "topScorers", path: "/players/topscorers"},
  {key: "topAssists", path: "/players/topassists"},
  {key: "topYellowCards", path: "/players/topyellowcards"},
  {key: "topRedCards", path: "/players/topredcards"},
];

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

function formatErrors(errors) {
  if (!errors) return "";
  if (Array.isArray(errors)) return errors.join("; ");
  if (typeof errors === "object") {
    return Object.entries(errors)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
        .join("; ");
  }
  return String(errors);
}

async function apiGet(pathname, params, apiKey) {
  const query = new URLSearchParams(params);
  const response = await fetch(`${API_BASE_URL}${pathname}?${query}`, {
    headers: {"x-apisports-key": apiKey},
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`API-Football ${pathname}: HTTP ${response.status}`);
  }
  const errorText = formatErrors(data.errors);
  if (errorText) {
    throw new Error(`API-Football ${pathname}: ${errorText}`);
  }
  return Array.isArray(data.response) ? data.response : [];
}

async function refreshInfo(state, apiKey) {
  if (isFresh(state.meta.infoFetchedAt, INFO_TTL_MS)) return;
  if (!canRequest(state.meta, 2)) return;

  state.payload.leagues = await apiGet("/leagues", {
    id: String(LEAGUE_ID),
    season: String(SEASON),
  }, apiKey);
  state.meta.requestCount += 1;

  state.payload.teams = await apiGet("/teams", {
    league: String(LEAGUE_ID),
    season: String(SEASON),
  }, apiKey);
  state.meta.requestCount += 1;
  state.meta.infoFetchedAt = Date.now();
}

async function refreshRankings(state, apiKey) {
  if (isFresh(state.meta.rankingsFetchedAt, RANKINGS_TTL_MS)) return;
  if (!canRequest(state.meta, RANKING_ENDPOINTS.length)) return;

  for (const endpoint of RANKING_ENDPOINTS) {
    state.payload[endpoint.key] = await apiGet(endpoint.path, {
      league: String(LEAGUE_ID),
      season: String(SEASON),
    }, apiKey);
    state.meta.requestCount += 1;
  }
  state.meta.rankingsFetchedAt = Date.now();
}

async function refreshFixtures(state, apiKey) {
  if (isFresh(state.meta.fixturesFetchedAt, FIXTURES_TTL_MS)) return;
  if (!canRequest(state.meta)) return;

  state.payload.fixtures = await apiGet("/fixtures", {
    league: String(LEAGUE_ID),
    season: String(SEASON),
  }, apiKey);
  state.meta.fixturesFetchedAt = Date.now();
  state.meta.requestCount += 1;
}

async function refreshStandings(state, apiKey) {
  if (isFresh(state.meta.standingsFetchedAt, STANDINGS_TTL_MS)) return;
  if (!canRequest(state.meta)) return;

  state.payload.standings = await apiGet("/standings", {
    league: String(LEAGUE_ID),
    season: String(SEASON),
  }, apiKey);
  state.meta.standingsFetchedAt = Date.now();
  state.meta.requestCount += 1;
}

function shouldRefreshLive(fixtures) {
  const now = Date.now();
  return (fixtures || []).some((item) => {
    const timestamp = item.fixture && Date.parse(item.fixture.date);
    if (!timestamp) return false;
    const status = item.fixture.status && item.fixture.status.short;
    if (["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(status)) {
      return true;
    }
    return Math.abs(timestamp - now) <= LIVE_WINDOW_MS;
  });
}

async function refreshLive(state, apiKey) {
  if (!shouldRefreshLive(state.payload.fixtures)) return;
  if (isFresh(state.meta.liveFetchedAt, LIVE_TTL_MS)) return;
  if (!canRequest(state.meta)) return;

  state.payload.liveFixtures = await apiGet("/fixtures", {
    league: String(LEAGUE_ID),
    season: String(SEASON),
    status: "1H-HT-2H-ET-P-BT-LIVE",
  }, apiKey);
  state.meta.liveFetchedAt = Date.now();
  state.meta.requestCount += 1;
}

function nextRefreshAt(meta) {
  const candidates = [
    Number(meta.infoFetchedAt || Date.now()) + INFO_TTL_MS,
    Number(meta.rankingsFetchedAt || Date.now()) + RANKINGS_TTL_MS,
    Number(meta.fixturesFetchedAt || Date.now()) + FIXTURES_TTL_MS,
    Number(meta.standingsFetchedAt || Date.now()) + STANDINGS_TTL_MS,
  ];
  if (meta.liveFetchedAt) candidates.push(Number(meta.liveFetchedAt) + LIVE_TTL_MS);
  return Math.min(...candidates);
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
    meta: {
      ...(payload.meta || {}),
      generatedAt: 0,
    },
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
  const apiKey = String(process.env.FOOTBALL_API_KEY || "").trim();

  if (!apiKey) {
    if (process.env.GITHUB_ACTIONS) {
      throw new Error("FOOTBALL_API_KEY nao configurada nos Secrets do GitHub Actions.");
    }
    writeIfChanged(current, output(state, "FOOTBALL_API_KEY ausente; dados mantidos"));
    return;
  }

  if (apiKey === "***" || apiKey.includes("*")) {
    throw new Error("FOOTBALL_API_KEY parece estar com valor mascarado/placeholder. Edite o secret e cole a chave real da API-Football.");
  }

  await refreshInfo(state, apiKey);
  await refreshRankings(state, apiKey);
  await refreshFixtures(state, apiKey);
  await refreshStandings(state, apiKey);
  await refreshLive(state, apiKey);
  const next = output(state);
  console.log("Football stats summary:", statsSummary(next));
  writeIfChanged(current, next);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
