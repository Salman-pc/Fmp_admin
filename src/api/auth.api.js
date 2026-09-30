import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  logout: () => axiosClient.post('/auth/logout'),
  refreshToken: (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken }),
  getMe: () => axiosClient.get('/auth/me')
};
