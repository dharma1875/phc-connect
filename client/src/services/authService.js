import api from './api';
import { TOKEN_KEY } from '../utils/constants';

export const authService = {
  login: async (credentials) => {
    return api.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  logout: async (token) => {
    return api.request('/auth/logout', {
      method: 'POST',
      token,
    });
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.request('/auth/me', {
      token,
    });
  },
};
