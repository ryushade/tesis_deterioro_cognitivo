// Tipos para Evaluaciones Cognitivas
export interface TipoEvaluacion {
  id_tipo: number;
  codigo: string;
  nombre: string;
  requiere_imagen: boolean;
  requiere_metodo: boolean;
  activo: boolean;
  creado_en: string;
}

export interface EvaluacionCognitiva {
  id_evaluacion: number;
  id_paciente: number;
  id_codigo?: number;
  id_tipo: number;
  fecha_evaluacion: string;
  puntuacion_total: number;
  puntuacion_maxima: number;
  porcentaje_acierto: number;
  clasificacion?: string;
  confianza?: number;
  estado_procesamiento: 'pendiente' | 'procesando' | 'completada' | 'fallida';
  tiempo_procesamiento?: number;
  version_algoritmo?: string;
  observaciones?: string;
  imagen_url?: string;
  metodo_cdt?: string;
  datos_especificos?: any;
  archivos_paths?: any;
  creado_por?: number;
  actualizado_en: string;
  
  // Campos relacionados (joins)
  paciente_nombre?: string;
  tipo_evaluacion_nombre?: string;
  tipo_evaluacion_codigo?: string;
  codigo_acceso?: string;
  creador_nombre?: string;
}

export interface EvaluacionCreate {
  id_paciente: number;
  id_codigo?: number;
  id_tipo: number;
  puntuacion_total: number;
  puntuacion_maxima: number;
  clasificacion?: string;
  confianza?: number;
  observaciones?: string;
  imagen_url?: string;
  metodo_cdt?: string;
  datos_especificos?: any;
  archivos_paths?: any;
}

export interface EvaluacionUpdate {
  id_tipo?: number;
  puntuacion_total?: number;
  puntuacion_maxima?: number;
  clasificacion?: string;
  confianza?: number;
  estado_procesamiento?: 'pendiente' | 'procesando' | 'completada' | 'fallida';
  observaciones?: string;
  imagen_url?: string;
  metodo_cdt?: string;
  datos_especificos?: any;
  archivos_paths?: any;
}

export interface EvaluacionesResponse {
  success: boolean;
  data: EvaluacionCognitiva[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  message?: string;
}

export interface EvaluacionResponse {
  success: boolean;
  data?: EvaluacionCognitiva;
  message: string;
}

export interface EvaluacionesStats {
  total_evaluaciones: number;
  por_estado: {
    pendiente: number;
    procesando: number;
    completada: number;
    fallida: number;
  };
  por_tipo: Array<{
    tipo: string;
    cantidad: number;
  }>;
  promedio_puntuacion: number;
  evaluaciones_recientes: number;
}
