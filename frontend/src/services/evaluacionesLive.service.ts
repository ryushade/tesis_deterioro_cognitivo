import type { EvaluacionCognitiva } from '@/types/evaluaciones';
import { apiClient } from './api';

export interface EvaluacionesPacienteResponse {
  success: boolean;
  data: EvaluacionCognitiva[];
  message?: string;
}

export const evaluacionesLiveService = {
  async getByPaciente(idPaciente: number): Promise<EvaluacionesPacienteResponse> {
    try {
      const response = await apiClient.get<EvaluacionesPacienteResponse>(`/cdt/pacientes/${idPaciente}/evaluaciones`);
      const payload = response.data;
      if (!payload.data) {
        return { success: payload.success, data: [], message: payload.message };
      }
      return payload;
    } catch (error: any) {
      if (error?.response?.data) {
        const data = error.response.data as EvaluacionesPacienteResponse;
        return {
          success: data.success,
          data: data.data || [],
          message: data.message || 'Error al obtener evaluaciones del paciente',
        };
      }
      return {
        success: false,
        data: [],
        message: 'Error de conexion al obtener evaluaciones del paciente',
      };
    }
  },
};
