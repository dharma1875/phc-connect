import api from './api';
import { TOKEN_KEY } from '../utils/constants';

export const doctorService = {
  getDashboard: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/doctor/dashboard', { token });
  },

  getProfile: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/doctor/profile', { token });
  },

  getFacility: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/doctor/facility', { token });
  },

  getTodayAttendance: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/attendance/today', { token });
  },

  getAttendanceSummary: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/attendance/summary', { token });
  },

  getAttendanceHistory: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/attendance/my', { token });
  },

  markAttendance: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/attendance/mark', { method: 'POST', token });
  },

  checkOutAttendance: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/attendance/check-out', { method: 'POST', token });
  },
};
