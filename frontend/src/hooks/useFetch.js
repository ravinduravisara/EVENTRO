import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CACHE_TTL_MS = 30_000;
const responseCache = new Map();

const useFetch = (url, options = {}) => {
  const {
    cache = true,
    ttl = CACHE_TTL_MS,
    cacheKey: customCacheKey,
    ...axiosOptions
  } = options || {};

  // Make cache session-aware so switching accounts doesn't reuse stale data.
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '';
  const cacheKey = cache && url ? (customCacheKey || `${token}::${url}`) : null;

  const cached = cacheKey ? responseCache.get(cacheKey) : null;
  const hasFreshCache = Boolean(cached && Date.now() - cached.ts < ttl);

  const [data, setData] = useState(() => (hasFreshCache ? cached.data : null));
  const [loading, setLoading] = useState(() => !hasFreshCache);
  const [error, setError] = useState(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    const cachedNow = cacheKey ? responseCache.get(cacheKey) : null;
    const hasFreshCacheNow = Boolean(cachedNow && Date.now() - cachedNow.ts < ttl);

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // Only show a spinner if we don't already have cached data.
        if (!hasFreshCacheNow) setLoading(true);
        setError(null);
        const response = await api.get(url, { ...axiosOptions, signal: controller.signal });
        setData(response.data);
        if (cacheKey) responseCache.set(cacheKey, { data: response.data, ts: Date.now() });
      } catch (err) {
        if (err.name === 'CanceledError') return;
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url) fetchData();
    return () => controller.abort();
  }, [url, fetchKey, cacheKey, ttl]);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  return { data, loading, error, refetch };
};

export default useFetch;
