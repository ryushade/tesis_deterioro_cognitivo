import { apiClient } from './api';

export interface DashboardMetrics {
  usuarios_activos: number;
  pacientes_registrados: number;
  evaluaciones_realizadas: number;
  neuropsicologos_activos: number;
  evaluaciones_por_mes: Array<{
    mes: string;
    cantidad: number;
  }>;
  pacientes_por_edad: Array<{
    rango_edad: string;
    cantidad: number;
  }>;
  evaluaciones_por_tipo: Array<{
    tipo: string;
    cantidad: number;
  }>;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardMetrics;
  message?: string;
}

export const dashboardService = {
  // Obtener métricas del dashboard
  async getMetrics(): Promise<DashboardResponse> {
    try {
      const response = await apiClient.get<DashboardResponse>('/dashboard/metrics');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener métricas del dashboard:', error);
      return {
        success: false,
        data: {
          usuarios_activos: 0,
          pacientes_registrados: 0,
          evaluaciones_realizadas: 0,
          neuropsicologos_activos: 0,
          evaluaciones_por_mes: [],
          pacientes_por_edad: [],
          evaluaciones_por_tipo: []
        },
        message: 'Error al cargar métricas del dashboard'
      };
    }
  },

  // Obtener estadísticas de pacientes
  async getPacientesStats(): Promise<{ success: boolean; data: any; message?: string }> {
    try {
      const response = await apiClient.get('/pacientes/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas de pacientes:', error);
      return {
        success: false,
        data: { total_activos: 0, total_inactivos: 0, total_general: 0 },
        message: 'Error al cargar estadísticas de pacientes'
      };
    }
  },

  // Obtener estadísticas de evaluaciones
  async getEvaluacionesStats(): Promise<{ success: boolean; data: any; message?: string }> {
    try {
      const response = await apiClient.get('/cdt/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas de evaluaciones:', error);
      return {
        success: false,
        data: { total_evaluaciones: 0 },
        message: 'Error al cargar estadísticas de evaluaciones'
      };
    }
  },

  // Obtener estadísticas de usuarios
  async getUsuariosStats(): Promise<{ success: boolean; data: any; message?: string }> {
    try {
      const response = await apiClient.get('/users/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      return {
        success: false,
        data: { total_activos: 0 },
        message: 'Error al cargar estadísticas de usuarios'
      };
    }
  }
};
