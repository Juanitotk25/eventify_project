// src/services/reportService.js - CON RENOVACIÓN DE TOKEN
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Función para refrescar el token
const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) {
    throw new Error('No hay refresh token');
  }
  
  try {
    const response = await axios.post(`${API_URL}/users/token/refresh/`, {
      refresh: refresh
    });
    
    const { access } = response.data;
    localStorage.setItem('access_token', access);
    return access;
  } catch (error) {
    // Si no se puede refrescar, limpiar tokens y redirigir
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/auth/sign-in';
    throw error;
  }
};

// Interceptor para requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses con manejo de token expirado
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si es error 401 y no es una solicitud de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Si ya se está refrescando, poner en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const reportService = {
  getAdminReports: async (period = 'all') => {
    try {
      console.log('🔄 Obteniendo reportes admin...');
      
      const response = await axiosInstance.get('/admin-reports/', {
        params: { period }
      });
      
      console.log('✅ Reportes recibidos');
      return response.data;
      
    } catch (error) {
      console.error('❌ Error en getAdminReports:', {
        status: error.response?.status,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      throw error;
    }
  },
};