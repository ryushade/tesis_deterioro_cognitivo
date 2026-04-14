import { apiClient } from './api';

export interface EvaluacionResultado {
  id_evaluacion: number;
  id_asignacion: number;
  fecha_evaluacion: string;
  estado_evaluacion: string | number;
  paciente_nombres: string;
  paciente_apellidos: string;
  id_prueba: number;
  nombre_prueba: string;
  id_analisis?: number;
  url_imagen?: string;
  puntaje_ia?: number;
  clasificacion_ia?: string;
  detalles_ia_jsonb?: any;
}

export interface ResultadosResponse {
  success: boolean;
  data: EvaluacionResultado[];
  message?: string;
}

export const resultadosService = {
  /**
   * Obtiene todos los resultados (evaluaciones) de un paciente.
   * Opcionalmente filtra por id_prueba.
   */
  async getResultadosPaciente(idPaciente: number, idPrueba?: number): Promise<ResultadosResponse> {
    const url = idPrueba 
      ? `/auth/obtener_resultados/${idPaciente}/${idPrueba}` 
      : `/auth/obtener_resultados/${idPaciente}`;
      
    const { data } = await apiClient.get<ResultadosResponse>(url);
    return data;
  }
};
