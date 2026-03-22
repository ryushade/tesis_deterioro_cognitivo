import api from './api';

export interface MMSEConfiguracion {
  id_configuracion: number;
  pregunta_id: string;
  respuesta_correcta: string;
  contexto: string;
  tipo_validacion: 'exacta' | 'parcial' | 'fuzzy';
  tolerancia_errores: number;
  puntuacion: number;
  es_activa: boolean;
  orden: number;
}

export interface CreateConfiguracionRequest {
  pregunta_id: string;
  respuesta_correcta: string;
  contexto: string;
  tipo_validacion: 'exacta' | 'parcial' | 'fuzzy';
  tolerancia_errores: number;
  puntuacion: number;
  es_activa: boolean;
  orden: number;
}

export interface ValidationRequest {
  pregunta_id: string;
  respuesta: string | number | boolean | null;
  contexto?: string;
}

export interface ValidationResponse {
  is_valid: boolean;
  message?: string;
}

export const mmseConfigService = {
  // Obtener todas las configuraciones, opcionalmente filtradas
  getConfiguraciones: async (pregunta_id?: string, contexto?: string) => {
    const params = new URLSearchParams();
    if (pregunta_id) params.append('pregunta_id', pregunta_id);
    if (contexto) params.append('contexto', contexto);
    
    const url = `/mmse-configuracion${params.toString() ? `?${params.toString()}` : ''}`;
    return api.get<MMSEConfiguracion[]>(url);
  },

  // Obtener lista de preguntas disponibles
  getPreguntas: async () => {
    return api.get<string[]>('/mmse-configuracion/preguntas');
  },

  // Obtener lista de contextos disponibles
  getContextos: async () => {
    return api.get<string[]>('/mmse-configuracion/contextos');
  },

  // Crear nueva configuración
  createConfiguracion: async (data: CreateConfiguracionRequest) => {
    return api.post<MMSEConfiguracion>('/mmse-configuracion', data);
  },

  // Actualizar configuración
  updateConfiguracion: async (id: number, data: CreateConfiguracionRequest) => {
    return api.put<MMSEConfiguracion>(`/mmse-configuracion/${id}`, data);
  },

  // Eliminar configuración
  deleteConfiguracion: async (id: number) => {
    return api.delete(`/mmse-configuracion/${id}`);
  },

  // Validar una respuesta (usado por mmseValidations.ts)
  validateAnswer: async (data: ValidationRequest) => {
    return api.post<ValidationResponse>('/mmse-configuracion/validar', data);
  }
};
