import apiClient from '@/lib/api';
import { ApiResponse, DashboardAnalytics } from '@/types';

export const analyticsService = {
  getDashboardStats: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardAnalytics>>('/analytics/dashboard');
    return data.data;
  },
};
