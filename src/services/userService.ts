import api from './api';

export const userService = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  getUser: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  createUser: async (userData: any) => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  updateUser: async (id: string, userData: any) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  updateProfile: async (profileData: any) => {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  },

  login: async (credentials: any) => {
    const { data } = await api.post('/users/login', credentials);
    return data;
  }
};
