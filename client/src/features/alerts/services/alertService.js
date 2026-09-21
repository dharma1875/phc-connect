import api from '../../../services/api';
import { TOKEN_KEY } from '../../../utils/constants';

const token = () => localStorage.getItem(TOKEN_KEY);

function queryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.append(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const alertService = {
  getAlerts: (filters = {}) => api.request(`/alerts${queryString(filters)}`, { token: token() }),
  getSummary: () => api.request('/alerts/summary', { token: token() }),
  getAlert: (id) => api.request(`/alerts/${id}`, { token: token() }),
  acknowledge: (id) => api.request(`/alerts/${id}/acknowledge`, { method: 'POST', token: token() }),
  resolve: (id, resolutionNote) => api.request(`/alerts/${id}/resolve`, { method: 'POST', token: token(), body: { resolutionNote } }),
  checkAbsenteeism: () => api.request('/alerts/check-absenteeism', { method: 'POST', token: token() }),
};