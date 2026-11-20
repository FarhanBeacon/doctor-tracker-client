import apiClient from '@/lib/api';
import { AdminUser, ApiResponse, AuthResponse } from '@/types';

export const authService = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return data.data;
  },

  register: async (payload: { name: string; email: string; password: string }) => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return data.data;
  },

  getMe: async () => {
    const { data } = await apiClient.get<ApiResponse<AdminUser>>('/auth/me');
    return data.data;
  },
};
