// src/services/api.js
import axios from 'axios';

// Usa la misma variable que ya tienes
const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación automáticamente
api.interceptors.request.use(
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

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.warn('Token expirado o inválido');
      // Opcional: Puedes redirigir a login si quieres
      // localStorage.removeItem('access_token');
      // window.location.href = '/auth/sign-in';
    }
    return Promise.reject(error);
  }
);

// API específica para usuarios
export const userAPI = {
  // Obtener el conteo de eventos del usuario
  getMyEventCount: async () => {
    try {
      const response = await api.get('/api/users/my-event-count/'); // ← Nota el /api/ extra
      return response.data;
    } catch (error) {
      console.error('Error fetching event count:', error);
      return { event_count: 0 };
    }
  },
};

// API para eventos (basado en tu código actual)
export const eventAPI = {
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/api/events/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  
  joinEvent: async (eventId) => {
    try {
      const response = await api.post(`/api/events/${eventId}/join/`);
      return response.data;
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  },
  
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events/', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  checkRegistration: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/check_registration/`);
      return response.data;
    } catch (error) {
      console.error('Error checking registration:', error);
      return { is_registered: false };
    }
  },
};

// Exportar la instancia de axios por si la necesitas directamente
export { api };
export default api;