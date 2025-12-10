import { api } from './api';

export const eventService = {
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/api/events/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  
  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
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
  
  checkRegistration: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/check_registration/`);
      return response.data;
    } catch (error) {
      console.error('Error checking registration:', error);
      return { is_registered: false, registration_id: null, status: null };
    }
  },
  
  // Obtener eventos del usuario con detalles de registro
  getMyEvents: async () => {
    try {
      const response = await api.get('/api/registrations/my_events/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my events:', error);
      return [];
    }
  }
};

export default eventService;