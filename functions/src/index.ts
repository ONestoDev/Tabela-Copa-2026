import {initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {defineSecret} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";

setGlobalOptions({maxInstances: 10});
initializeApp();

const footballApiKey = defineSecret("FOOTBALL_API_KEY");
const API_HOST = "v3.football.api-sports.io";
const API_BASE_URL = `https://${API_HOST}`;
const LEAGUE_ID = 1;
const SEASON = 2026;
const DAILY_LIMIT = 50;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_DOC = "footballApi/tournamentStats";

const ENDPOINTS = [
  {key: "topScorers", path: "/players/topscorers"},
  {key: "topAssists", path: "/players/topassists"},
  {key: "topYellowCards", path: "/players/topyellowcards"},
  {key: "topRedCards", path: "/players/topredcards"},
];

type CachePayload = {
  topScorers?: unknown[];
  topAssists?: unknown[];
  topYellowCards?: unknown[];
  topRedCards?: unknown[];
};

type CacheState = {
  day: string;
  payload: CachePayload;
  fetchedAt: number;
  requestCount: number;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function cors(req: Parameters<Parameters<typeof onRequest>[1]>[0], res: Parameters<Parameters<typeof onRequest>[1]>[1]): boolean {
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

function normalizeCache(data: FirebaseFirestore.DocumentData = {}): CacheState {
  const day = todayKey();
  return {
    day,
    payload: data.payload || {},
    fetchedAt: Number(data.fetchedAt) || 0,
    requestCount: data.day === day ? Number(data.requestCount) || 0 : 0,
  };
}

function hasFreshPayload(cache: CacheState): boolean {
  return Boolean(cache.fetchedAt && Date.now() - cache.fetchedAt < CACHE_TTL_MS && cache.payload);
}

async function requestEndpoint(endpoint: {key: string; path: string}, apiKey: string): Promise<unknown[]> {
  const params = new URLSearchParams({
    league: String(LEAGUE_ID),
    season: String(SEASON),
  });
  const response = await fetch(`${API_BASE_URL}${endpoint.path}?${params}`, {
    headers: {"x-apisports-key": apiKey},
  });
  if (!response.ok) {
    throw new Error(`API-Football ${endpoint.key}: HTTP ${response.status}`);
  }
  const data = await response.json() as {response?: unknown[]};
  return Array.isArray(data.response) ? data.response : [];
}

export const tournamentStats = onRequest(
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

    if (hasFreshPayload(cache)) {
      res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
      res.json({...cache.payload, meta: {...cache, fromCache: true}});
      return;
    }

    if (cache.requestCount + ENDPOINTS.length > DAILY_LIMIT) {
      res.status(429).json({
        ...cache.payload,
        meta: {
          ...cache,
          fromCache: true,
          warning: "Limite diario de requisicoes atingido",
        },
      });
      return;
    }

    try {
      const payload: CachePayload = {};
      for (const endpoint of ENDPOINTS) {
        payload[endpoint.key as keyof CachePayload] = await requestEndpoint(endpoint, footballApiKey.value());
        cache.requestCount += 1;
      }

      cache.payload = payload;
      cache.fetchedAt = Date.now();
      await ref.set({...cache, updatedAt: Timestamp.now()}, {merge: true});

      res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
      res.json({...payload, meta: {...cache, fromCache: false}});
    } catch (error) {
      logger.error("Failed to refresh tournament stats", error);
      res.status(502).json({
        ...cache.payload,
        meta: {
          ...cache,
          fromCache: true,
          warning: "Erro ao consultar API-Football",
        },
      });
    }
  }
);
