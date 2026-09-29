import axiosClient from './axiosClient';

export const reportApi = {
  getDashboardSummary: () => axiosClient.get('/reports/dashboard'),
  getAttendanceReport: (params) => axiosClient.get('/reports/attendance', { params }),
  getUserAttendanceStats: () => axiosClient.get('/reports/users-stats')
};
