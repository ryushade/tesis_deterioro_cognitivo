import { apiClient } from './api';

export interface CategoriaMMSEResultado {
  id_categoria: number;
  nombre_categoria: string;
  puntaje_maximo: number;
  puntaje_obtenido: number;
}

export interface ItemMMSEResultadoDetalle {
  id_item: number;
  texto_item: string;
  nombre_categoria: string;
  respuesta_texto: string;
  correcto: boolean;
  puntaje: number;
  observacion?: string;
}

export interface EvaluacionResultado {
  id_evaluacion: number;
  id_asignacion: number;
  fecha_evaluacion: string;
  estado_evaluacion: string | number;
  paciente_nombres: string;
  paciente_apellidos: string;
  id_prueba: number;
  nombre_prueba: string;
  puntaje_total?: number;
  puntaje_maximo_prueba?: number;
  id_analisis?: number;
  url_imagen?: string;
  puntaje_ia?: number;
  clasificacion_ia?: string;
  observaciones_ia?: string;
  detalles_ia_jsonb?: any;
  categorias_mmse?: CategoriaMMSEResultado[];
  respuestas_detalle?: ItemMMSEResultadoDetalle[];
  duracion_segundos?: number;
}

export interface ResultadosResponse {
  success: boolean;
  data: EvaluacionResultado[];
  message?: string;
}

export interface SugerenciaIAResponse {
  success: boolean;
  data?: {
    clasificacion: 'Normal' | 'Deterioro Cognitivo Leve' | 'Deterioro Cognitivo Moderado' | 'Deterioro Cognitivo Severo' | 'Deterioro Cognitivo Grave';
    riesgo_pct: number;
    analisis: string;
  };
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
  },

  /**
   * Obtiene la sugerencia diagnóstica generada por la IA para un paciente.
   */
  async getSugerenciaIA(idPaciente: number, regenerar = false): Promise<SugerenciaIAResponse> {
    const url = `/auth/sugerencia-ia/${idPaciente}${regenerar ? '?regenerar=true' : ''}`;
    const { data } = await apiClient.get<SugerenciaIAResponse>(url);
    return data;
  }
};


