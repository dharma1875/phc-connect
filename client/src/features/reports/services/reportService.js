import api from '../../../services/api';
import { TOKEN_KEY } from '../../../utils/constants';

const token = () => localStorage.getItem(TOKEN_KEY);

function query(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.append(key, value);
  });
  const text = params.toString();
  return text ? `?${text}` : '';
}

export const reportService = {
  getSummary: (filters) => api.request(`/reports/summary${query(filters)}`, { token: token() }),
  getAttendance: (filters) => api.request(`/reports/attendance${query(filters)}`, { token: token() }),
  getAttendanceTrend: (filters) => api.request(`/reports/attendance/trend${query(filters)}`, { token: token() }),
  getServices: (filters) => api.request(`/reports/services${query(filters)}`, { token: token() }),
  getServiceTrend: (filters) => api.request(`/reports/services/trend${query(filters)}`, { token: token() }),
  getAbsenteeism: (filters) => api.request(`/reports/absenteeism${query(filters)}`, { token: token() }),
  getAbsenteeismTrend: (filters) => api.request(`/reports/absenteeism/trend${query(filters)}`, { token: token() }),
  getFacilities: (filters) => api.request(`/reports/facilities${query(filters)}`, { token: token() }),
  getTaluks: (filters) => api.request(`/reports/taluks${query(filters)}`, { token: token() }),
  getFacilityTypes: (filters) => api.request(`/reports/facility-types${query(filters)}`, { token: token() }),
};