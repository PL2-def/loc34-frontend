/**
 * @file api/index.js
 * @description Axios instance configuration for backend communication.
 * Includes interceptors for automatic JWT attachment, 401 Unauthorized handling, and caching.
 */

import axios from 'axios';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHEABLE_URLS = ['/settings', '/vehicles', '/options'];

// Get API URL dynamically from query param, localStorage, or environment variable
const getBaseURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const paramApi = urlParams.get('api');
  if (paramApi) {
    const formattedApi = paramApi.endsWith('/api') ? paramApi : `${paramApi.replace(/\/$/, '')}/api`;
    localStorage.setItem('loc34_api_url', formattedApi);
    const url = new URL(window.location.href);
    url.searchParams.delete('api');
    window.history.replaceState({}, '', url.pathname + url.search);
    return formattedApi;
  }
  return localStorage.getItem('loc34_api_url') || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

/**
 * Global Axios instance with base URL configuration.
 */
const api = axios.create({
  baseURL: getBaseURL(),
});

/**
 * Request Interceptor:
 * Automatically attaches the Bearer token from localStorage to every outgoing request.
 * Handles client-side response caching.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Client-side caching of GET requests to optimize performance
  const isGet = config.method === 'get' || (config.method && config.method.toLowerCase() === 'get');
  if (isGet && CACHEABLE_URLS.some(url => config.url && config.url.includes(url))) {
    const cached = cache.get(config.url);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      config.adapter = () => {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config,
          request: {}
        });
      };
    }
  }

  // Clear cache on mutations (POST, PUT, DELETE) to ensure state integrity
  const method = config.method ? config.method.toLowerCase() : '';
  if (['post', 'put', 'delete'].includes(method)) {
    cache.clear();
  }

  return config;
});

/**
 * Response Interceptor:
 * Handles global response logic, caching storage, and 401 redirecting.
 */
api.interceptors.response.use(
  (response) => {
    const { config } = response;
    const isGet = config.method === 'get' || (config.method && config.method.toLowerCase() === 'get');
    if (isGet && CACHEABLE_URLS.some(url => config.url && config.url.includes(url))) {
      cache.set(config.url, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login while preserving sub-path compatibility
      const baseUrl = import.meta.env.BASE_URL || '/';
      window.location.href = baseUrl + (baseUrl.endsWith('/') ? 'login' : '/login');
    }
    return Promise.reject(error);
  }
);

export default api;