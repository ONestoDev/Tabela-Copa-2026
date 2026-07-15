const {initializeApp} = require("firebase-admin/app");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");
const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

setGlobalOptions({maxInstances: 10});
initializeApp();

const footballApiKey = defineSecret("FOOTBALL_API_KEY");
const API_HOST = "v3.football.api-sports.io";
const API_BASE_URL = `https://${API_HOST}`;
const LEAGUE_ID = 1;
const SEASON = 2026;
const DAILY_LIMIT = 50;
const RANKINGS_TTL_MS = 24 * 60 * 60 * 1000;
const FIXTURES_TTL_MS = 60 * 60 * 1000;
const LIVE_TTL_MS = 2 * 60 * 1000;
const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;
const CACHE_DOC = "footballApi/tournamentStats";

const RANKING_ENDPOINTS = [
  {key: "topScorers", path: "/players/topscorers"},
  {key: "topAssists", path: "/players/topassists"},
  {key: "topYellowCards", path: "/players/topyellowcards"},
  {key: "topRedCards", path: "/players/topredcards"},
];

/**
 * Returns the UTC day key used by the shared API cache.
 * @return {string}
 */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Applies CORS headers and handles preflight requests.
 * @param {object} req
 * @param {object} res
 * @return {boolean}
 */
function cors(req, res) {
  res.set("Access-Control-Allow-Origin", req.get("origin") || "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Vary", "Origin");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

/**
 * Normalizes the Firestore cache document for the current day.
 * @param {object} data
 * @return {object}
 */
function normalizeCache(data = {}) {
  const day = todayKey();
  return {
    ...data,
    day,
    payload: data.payload || {},
    requestCount: data.day === day ? Number(data.requestCount) || 0 : 0,
  };
}

/**
 * Checks whether a cached block is still fresh.
 * @param {number} fetchedAt
 * @param {number} ttl
 * @return {boolean}
 */
function isFresh(fetchedAt, ttl) {
  return Boolean(fetchedAt && Date.now() - Number(fetchedAt) < ttl);
}

/**
 * Returns true when another API request fits in today's budget.
 * @param {object} cache
 * @param {number} amount
 * @return {boolean}
 */
function canRequest(cache, amount = 1) {
  return cache.requestCount + amount <= DAILY_LIMIT;
}

/**
 * Calls one API-Football endpoint.
 * @param {string} path
 * @param {object} params
 * @param {string} apiKey
 * @return {Promise<Array<unknown>>}
 */
async function apiGet(path, params, apiKey) {
  const query = new URLSearchParams(params);
  const response = await fetch(`${API_BASE_URL}${path}?${query}`, {
    headers: {"x-apisports-key": apiKey},
  });
  if (!response.ok) {
    throw new Error(`API-Football ${path}: HTTP ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data.response) ? data.response : [];
}

/**
 * Refreshes daily player rankings when needed.
 * @param {object} cache
 * @param {string} apiKey
 * @return {Promise<void>}
 */
async function refreshRankings(cache, apiKey) {
  if (isFresh(cache.rankingsFetchedAt, RANKINGS_TTL_MS)) return;
  if (!canRequest(cache, RANKING_ENDPOINTS.length)) return;

  const payload = {...cache.payload};
  for (const endpoint of RANKING_ENDPOINTS) {
    payload[endpoint.key] = await apiGet(endpoint.path, {
      league: String(LEAGUE_ID),
      season: String(SEASON),
    }, apiKey);
    cache.requestCount += 1;
  }
  cache.payload = payload;
  cache.rankingsFetchedAt = Date.now();
}

/**
 * Refreshes official tournament fixtures.
 * @param {object} cache
 * @param {string} apiKey
 * @return {Promise<void>}
 */
async function refreshFixtures(cache, apiKey) {
  if (isFresh(cache.fixturesFetchedAt, FIXTURES_TTL_MS)) return;
  if (!canRequest(cache)) return;

  cache.payload = {
    ...cache.payload,
    fixtures: await apiGet("/fixtures", {
      league: String(LEAGUE_ID),
      season: String(SEASON),
    }, apiKey),
  };
  cache.fixturesFetchedAt = Date.now();
  cache.requestCount += 1;
}

/**
 * Determines if the next scheduled fixture is close enough for live polling.
 * @param {Array<object>} fixtures
 * @return {boolean}
 */
function shouldRefreshLive(fixtures = []) {
  const now = Date.now();
  return fixtures.some((item) => {
    const timestamp = item.fixture && Date.parse(item.fixture.date);
    if (!timestamp) return false;
    const status = item.fixture.status && item.fixture.status.short;
    if (["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(status)) {
      return true;
    }
    return Math.abs(timestamp - now) <= LIVE_WINDOW_MS;
  });
}

/**
 * Refreshes live fixtures only near match time.
 * @param {object} cache
 * @param {string} apiKey
 * @return {Promise<void>}
 */
async function refreshLive(cache, apiKey) {
  if (!shouldRefreshLive(cache.payload.fixtures)) return;
  if (isFresh(cache.liveFetchedAt, LIVE_TTL_MS)) return;
  if (!canRequest(cache)) return;

  cache.payload = {
    ...cache.payload,
    liveFixtures: await apiGet("/fixtures", {
      league: String(LEAGUE_ID),
      season: String(SEASON),
      live: "all",
    }, apiKey),
  };
  cache.liveFetchedAt = Date.now();
  cache.requestCount += 1;
}

/**
 * Builds a compact metadata block for the client cache.
 * @param {object} cache
 * @param {boolean} fromCache
 * @param {string=} warning
 * @return {object}
 */
function meta(cache, fromCache, warning = "") {
  const nextRefreshAt = Math.min(
      Number(cache.rankingsFetchedAt || Date.now()) + RANKINGS_TTL_MS,
      Number(cache.fixturesFetchedAt || Date.now()) + FIXTURES_TTL_MS,
      Number(cache.liveFetchedAt || Date.now()) + LIVE_TTL_MS,
  );
  return {
    fromCache,
    warning,
    fetchedAt: Math.max(
        Number(cache.rankingsFetchedAt) || 0,
        Number(cache.fixturesFetchedAt) || 0,
        Number(cache.liveFetchedAt) || 0,
    ),
    nextRefreshAt,
    requestCount: cache.requestCount || 0,
    dailyLimit: DAILY_LIMIT,
  };
}

exports.tournamentStats = onRequest(
    {secrets: [footballApiKey], region: "us-central1"},
    async (req, res) => {
      if (cors(req, res)) return;
      if (req.method !== "GET") {
        res.status(405).json({error: "Method not allowed"});
        return;
      }

      const db = getFirestore();
      const ref = db.doc(CACHE_DOC);
      const snapshot = await ref.get();
      const cache = normalizeCache(snapshot.exists ? snapshot.data() : {});
      const beforeCount = cache.requestCount;

      try {
        await refreshRankings(cache, footballApiKey.value());
        await refreshFixtures(cache, footballApiKey.value());
        await refreshLive(cache, footballApiKey.value());
        await ref.set({...cache, updatedAt: Timestamp.now()}, {merge: true});

        res.set("Cache-Control", "public, max-age=60, s-maxage=60");
        res.json({
          ...cache.payload,
          meta: meta(cache, cache.requestCount === beforeCount),
        });
      } catch (error) {
        logger.error("Failed to refresh tournament stats", error);
        res.status(502).json({
          ...cache.payload,
          meta: meta(cache, true, "Erro ao consultar API-Football"),
        });
      }
    },
);
