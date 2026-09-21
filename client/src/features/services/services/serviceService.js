import api from '../../../services/api';
import { TOKEN_KEY } from '../../../utils/constants';

export const serviceService = {
  getServiceTypes: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/services/types', { token });
  },

  getServiceSummary: async (month, year) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const query = new URLSearchParams();
    if (month) query.append('month', month);
    if (year) query.append('year', year);
    return api.request(`/services/summary${query.toString() ? `?${query.toString()}` : ''}`, { token });
  },

  getMyReports: async (month, year) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const query = new URLSearchParams();
    if (month) query.append('month', month);
    if (year) query.append('year', year);
    return api.request(`/services/my${query.toString() ? `?${query.toString()}` : ''}`, { token });
  },

  getTodayReport: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/services/today', { token });
  },

  submitReport: async (payload) => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/services/submit', {
      method: 'POST',
      body: payload,
      token,
    });
  },
};
