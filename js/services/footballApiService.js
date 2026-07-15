(function () {
  const API_ENDPOINT = window.FOOTBALL_STATS_ENDPOINT || 'js/data/apiStats.json';
  const CACHE_KEY = 'copa2026-football-api-cache-v1';
  const FALLBACK_CACHE_TTL_MS = 5 * 60 * 1000;

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function writeCache(cache) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }

  function normalizeCache(cache) {
    const day = todayKey();
    if(cache.day !== day) {
      cache.day = day;
      cache.requestCount = 0;
    }
    cache.payload = cache.payload || {};
    cache.fetchedAt = Number(cache.fetchedAt) || 0;
    return cache;
  }

  function hasFreshPayload(cache) {
    if(cache.nextRefreshAt) return Date.now() < Number(cache.nextRefreshAt) && cache.payload;
    return cache.fetchedAt && Date.now() - cache.fetchedAt < FALLBACK_CACHE_TTL_MS && cache.payload;
  }

  function meta(cache, fromCache, warning = '') {
    return {
      fromCache,
      warning,
      fetchedAt: cache.fetchedAt || 0,
      nextRefreshAt: cache.nextRefreshAt || 0,
      requestCount: cache.requestCount || 0,
      dailyLimit: cache.dailyLimit || 50
    };
  }

  async function loadTournamentStats() {
    const cache = normalizeCache(readCache());
    if(hasFreshPayload(cache)) return {...cache.payload, meta: meta(cache, true)};

    const response = await fetch(API_ENDPOINT, {headers: {'Accept':'application/json'}});
    const payload = await response.json();
    if(!response.ok && !payload) throw new Error(`Stats proxy HTTP ${response.status}`);

    cache.payload = payload || {};
    cache.fetchedAt = payload?.meta?.fetchedAt || Date.now();
    cache.nextRefreshAt = payload?.meta?.nextRefreshAt || (Date.now() + FALLBACK_CACHE_TTL_MS);
    cache.requestCount = payload?.meta?.requestCount || 0;
    cache.dailyLimit = payload?.meta?.dailyLimit || 50;
    writeCache(cache);
    return {...cache.payload, meta: payload?.meta || meta(cache, false)};
  }

  function cachedTournamentStats() {
    const cache = normalizeCache(readCache());
    return {...cache.payload, meta: meta(cache, true)};
  }

  window.FootballApiService = {
    loadTournamentStats,
    cachedTournamentStats
  };
})();
