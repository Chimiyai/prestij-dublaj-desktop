// src/lib/api.ts
import axios from 'axios';

// API sunucumuzun ana adresi
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Axios Interceptor (Araya Girici)
// Bu fonksiyon, bir istek gönderilmeden HEMEN ÖNCE çalışır.
api.interceptors.request.use(
  async (config) => {
    // electron-store'dan token'ı al
    const token = await window.electronStore.get('session-token');

    // Eğer token varsa, isteğin Authorization başlığına ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;