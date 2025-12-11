import { api } from './api';

export const attendanceService = {
  // Confirmar asistencia
  confirmAttendance: (registrationId) => {
    return api.post(`/api/registrations/${registrationId}/confirm_attendance/`);
  },
  
  // Obtener reporte de asistencia de un evento (para organizador)
  getEventAttendanceReport: (eventId) => {
    return api.get(`/api/events/${eventId}/attendance_report/`);
  },
  
  // Obtener reportes globales (para admin)
  getAdminReports: (params = {}) => {
    return api.get('/api/admin-reports/', { params });
  }
};

export default attendanceService;