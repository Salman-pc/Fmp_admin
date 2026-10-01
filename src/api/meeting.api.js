import axiosClient from './axiosClient';

export const meetingApi = {
  getCurrentActive: () => axiosClient.get('/meetings/current'),
  getAll: (params) => axiosClient.get('/meetings', { params }),
  getById: (id) => axiosClient.get(`/meetings/${id}`),
  create: (data) => axiosClient.post('/meetings', data),
  update: (id, data) => axiosClient.patch(`/meetings/${id}`, data),
  toggleCheckIn: (id, checkInEnabled) => axiosClient.patch(`/admin/meetings/${id}/toggle-checkin`, { checkInEnabled }),
  getPresentUsers: (id) => axiosClient.get(`/admin/meetings/${id}/present-users`),
  delete: (id) => axiosClient.delete(`/meetings/${id}`)
};
