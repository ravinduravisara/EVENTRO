import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const cachedNow = cacheKey ? responseCache.get(cacheKey) : null;
    const hasFreshCacheNow = Boolean(cachedNow && Date.now() - cachedNow.ts < ttl);

    const controller = new AbortController();

    const fetchData = async () => {
      try {
<<<<<<< HEAD
        // Only show a spinner if we don't already have cached data.
        if (!hasFreshCacheNow) setLoading(true);
        setError(null);
        const response = await api.get(url, { ...axiosOptions, signal: controller.signal });
=======
        setLoading(true);
        const response = await api.get(url, options);
>>>>>>> parent of a197612 (Event management)
        setData(response.data);
        if (cacheKey) responseCache.set(cacheKey, { data: response.data, ts: Date.now() });
      } catch (err) {
        if (err.name === 'CanceledError') return;
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

<<<<<<< HEAD
    if (url) fetchData();
    return () => controller.abort();
  }, [url, fetchKey, cacheKey, ttl]);
=======
    fetchData();
  }, [url]);
>>>>>>> parent of a197612 (Event management)

  return { data, loading, error, refetch: () => setData(null) };
};

export default useFetch;
