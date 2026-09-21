import api from '../../../services/api';
import { TOKEN_KEY } from '../../../utils/constants';

const token = () => localStorage.getItem(TOKEN_KEY);

export const ddhsService = {
  getDashboard: async () => {
    return api.request('/ddhs/dashboard', { token: token() });
  },

  getDistricts: async () => {
    return api.request('/ddhs/districts', { token: token() });
  },

  getTaluksByDistrict: async (districtId) => {
    return api.request(`/ddhs/districts/${districtId}/taluks`, { token: token() });
  },

  getFacilities: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const query = params.toString();
    return api.request(`/ddhs/facilities${query ? `?${query}` : ''}`, { token: token() });
  },

  getFacilityById: async (facilityId) => {
    return api.request(`/ddhs/facilities/${facilityId}`, { token: token() });
  },

  getFacilityDoctors: async (facilityId) => {
    return api.request(`/ddhs/facilities/${facilityId}/doctors`, { token: token() });
  },

  getAttendance: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const query = params.toString();
    return api.request(`/ddhs/attendance${query ? `?${query}` : ''}`, { token: token() });
  },

  getAttendanceSummary: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const query = params.toString();
    return api.request(`/ddhs/attendance/summary${query ? `?${query}` : ''}`, { token: token() });
  },

  getServices: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const query = params.toString();
    return api.request(`/ddhs/services${query ? `?${query}` : ''}`, { token: token() });
  },

  getServiceSummary: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const query = params.toString();
    return api.request(`/ddhs/services/summary${query ? `?${query}` : ''}`, { token: token() });
  },
};
