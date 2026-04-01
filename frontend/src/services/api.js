import axios from 'axios';

// Determine API base URL based on environment
const getBaseURL = () => {
  // Use VITE_BACKEND_URL env var if set (for deployed environments)
  if (import.meta.env.VITE_BACKEND_URL) {
    const raw = String(import.meta.env.VITE_BACKEND_URL).trim().replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  
  // Use relative path for local development (Vite proxy handles this)
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let axios auto-set Content-Type with boundary for FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const path = window.location?.pathname || '';

      // Don't hard-redirect when the user is actively trying to login/register.
      const isAuthAttempt =
        requestUrl.includes('/users/login') ||
        requestUrl.includes('/users/register') ||
        requestUrl.includes('/users/verify-email') ||
        requestUrl.includes('/users/verify-email-otp') ||
        requestUrl.includes('/users/resend-verification-email') ||
        requestUrl.includes('/users/forgot-access-otp/request') ||
        requestUrl.includes('/users/forgot-access-otp/verify');

      const hadToken = Boolean(localStorage.getItem('token'));
      const isAdminArea = path.startsWith('/admin') || path.startsWith('/eventro-admin');

      // If there was no session token, let callers handle unauthenticated states
      // (e.g., show "Please login" on protected pages) instead of making the
      // whole site unusable.
      if (!hadToken && !isAdminArea) {
        return Promise.reject(error);
      }

      if (!isAuthAttempt) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      if (isAdminArea) {
        window.location.href = '/eventro-admin';
      } else if (!isAuthAttempt) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
