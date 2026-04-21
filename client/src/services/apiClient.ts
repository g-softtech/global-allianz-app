import axios from 'axios';
import { useAuthStore, getCustomerToken, getAdminToken } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the correct token based on which session is active
apiClient.interceptors.request.use(
  (config) => {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const token = isAdminPath
      ? (getAdminToken() || useAuthStore.getState().token)
      : (getCustomerToken() || useAuthStore.getState().token);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ONLY logout on 401 (invalid/expired token)
// Do NOT logout on 429 (rate limit), 403 (forbidden), 404, 500 etc.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      useAuthStore.getState().logout();
      window.location.href = isAdminPath ? '/admin/login' : '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
