
import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_CORE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
