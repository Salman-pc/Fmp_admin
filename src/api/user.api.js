import axiosClient from './axiosClient';

export const userApi = {
  getUsers: (params) => axiosClient.get('/users', { params }),
  createUser: (data) => axiosClient.post('/users', data),
  updateUser: (id, data) => axiosClient.patch(`/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`)
};
