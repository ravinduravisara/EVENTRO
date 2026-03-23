import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CACHE_TTL_MS = 30_000;
const responseCache = new Map();

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    const cacheKey = url;
    const cached = cacheKey ? responseCache.get(cacheKey) : null;
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setData(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(url, { ...options, signal: controller.signal });
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
  }, [url, fetchKey]);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  return { data, loading, error, refetch };
};

export default useFetch;
