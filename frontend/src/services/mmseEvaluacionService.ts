import api from './api';

// ========== Interfaces de estructura ==========

export interface ItemMMSE {
  id_item: number;
  texto_item: string;
  criterio_correccion: string | null;
  respuesta_esperada: string | null;
  tipo_respuesta: string;
  orden: number;
  puntaje_maximo: number;
  requiere_revision_manual: boolean;
}

export interface OpcionMMSE {
  id_opcion: number;
  nombre_opcion: string;
  instrucciones: string | null;
  orden: number;
  es_default: boolean;
  puntaje_maximo: number;
  items: ItemMMSE[];
}

export interface SeccionMMSE {
  id_seccion: number;
  nombre_seccion: string;
  descripcion: string | null;
  instrucciones_aplicacion: string | null;
  orden: number;
  puntaje_maximo: number;
  permite_opciones: boolean;
  requiere_material: boolean;
  opciones: OpcionMMSE[];
}

export interface CategoriaMMSE {
  id_categoria: number;
  nombre_categoria: string;
  puntaje_maximo: number;
  secciones: SeccionMMSE[];
}

export interface EstructuraMMSE {
  id_prueba: number;
  nombre_prueba: string;
  puntaje_maximo: number;
  categorias: CategoriaMMSE[];
}

export interface AsignacionInfo {
  id_asignacion: number;
  nombre_paciente: string;
  nombre_prueba: string;
}

export interface EvaluacionInfo {
  id_evaluacion: number;
  estado_evaluacion: number;
  puntaje_total: number | null;
  duracion_segundos?: number | null;
  tiempos?: Record<string, number>;
}

// ========== Interfaces de respuesta ==========

export interface SeccionPayload {
  id_evaluacion: number;
  id_seccion: number;
  id_opcion_aplicada: number;
  orden_aplicacion: number;
  aplicada?: boolean;
  omitida?: boolean;
  motivo_omision?: string;
  intentos_aprendizaje?: number;
  aprendio_estimulos?: boolean;
  observacion?: string;
}

export interface RespuestaItemPayload {
  id_eval_seccion: number;
  id_opcion: number;
  id_item: number;
  respuesta_texto?: string;
  respuesta_json?: Record<string, unknown>;
  correcto: boolean;
  puntaje: 0 | 1;
  omitido?: boolean;
  motivo_omision?: string;
  requiere_revision?: boolean;
  archivo_evidencia?: string;
  observacion?: string;
}

export interface ResultadoCategoria {
  id_categoria: number;
  nombre_categoria: string;
  puntaje_maximo: number;
  puntaje_obtenido: number;
}

export interface ResultadoFinal {
  puntaje_total: number;
  categorias: ResultadoCategoria[];
  tiempos?: Record<string, number>;
}

// ========== Servicio ==========

export const mmseEvaluacionService = {
  /**
   * Obtiene la estructura completa del MMSE + datos de asignación y evaluación existente.
   */
  obtenerEstructura: async (idAsignacion: number): Promise<{
    success: boolean;
    estructura?: EstructuraMMSE;
    asignacion?: AsignacionInfo;
    evaluacion?: EvaluacionInfo | null;
    message?: string;
  }> => {
    try {
      const response = await api.get(`/mmse/estructura/${idAsignacion}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estructura MMSE'
      };
    }
  },

  /**
   * Crea o recupera evaluacion_cognitiva para una asignación.
   */
  iniciarEvaluacion: async (idAsignacion: number): Promise<{
    success: boolean;
    data?: {
      id_evaluacion: number;
      estado_evaluacion: number;
      puntaje_total: number | null;
      nombre_paciente: string;
      es_nueva: boolean;
    };
    message?: string;
  }> => {
    try {
      const response = await api.post('/mmse/evaluacion/iniciar', {
        id_asignacion: idAsignacion
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar evaluación'
      };
    }
  },

  /**
   * Guarda o actualiza una sección aplicada.
   */
  guardarSeccion: async (payload: SeccionPayload): Promise<{
    success: boolean;
    data?: { id_eval_seccion: number };
    message?: string;
  }> => {
    try {
      const response = await api.post('/mmse/evaluacion/seccion', payload);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar sección'
      };
    }
  },

  /**
   * Guarda o actualiza la respuesta de un ítem.
   */
  guardarRespuesta: async (payload: RespuestaItemPayload): Promise<{
    success: boolean;
    data?: { id_respuesta: number };
    message?: string;
  }> => {
    try {
      const response = await api.post('/mmse/evaluacion/respuesta', payload);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar respuesta'
      };
    }
  },

  /**
   * Calcula puntajes y finaliza la evaluación.
   */
  finalizarEvaluacion: async (idEvaluacion: number, tiempos?: Record<string, number>, duracionSegundos?: number): Promise<{
    success: boolean;
    data?: ResultadoFinal;
    message?: string;
  }> => {
    try {
      const response = await api.post(`/mmse/evaluacion/finalizar/${idEvaluacion}`, {
        tiempos,
        duracion_segundos: duracionSegundos
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al finalizar evaluación'
      };
    }
  }
};
