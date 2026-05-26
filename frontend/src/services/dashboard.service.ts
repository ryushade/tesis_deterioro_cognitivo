import { apiClient } from './api';
import type { DashboardMetrics } from '@/hooks/useDashboardMetrics';

export interface DashboardMetricsResponse {
  success: boolean;
  data: DashboardMetrics;
  message?: string;
}

export const dashboardService = {
  /**
   * Obtiene las métricas generales para el dashboard principal.
   */
  async getMetrics(): Promise<DashboardMetricsResponse> {
    const { data } = await apiClient.get<DashboardMetricsResponse>('/auth/dashboard-metrics');
    return data;
  }
};
