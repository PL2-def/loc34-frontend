/**
 * @file api/index.js
 * @description Axios instance configuration for backend communication.
 * Includes interceptors for automatic JWT attachment and 401 Unauthorized handling.
 */

import axios from 'axios';

/**
 * Global Axios instance with base URL configuration.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

/**
 * Request Interceptor:
 * Automatically attaches the Bearer token from localStorage to every outgoing request.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response Interceptor:
 * Handles global response logic. 
 * If a 401 (Unauthorized) error is received, it clears local auth data and 
 * redirects the user to the login page.
 */
api.interceptors.response.use(
  (response) => response,
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