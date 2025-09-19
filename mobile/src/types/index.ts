export interface CodigoAcceso {
  codigo_valido: boolean;
  instrucciones: string;
  tiempo_limite: number;
  paciente: {
    id: number;
    nombre_completo: string;
    edad: number;
  };
  evaluacion: {
    codigo_id: number;
    tipo: string;
  };
}

export interface EvaluacionCDT {
  id_evaluacion: number;
  paciente_id: number;
  codigo_acceso: string;
  estado: 'pendiente' | 'procesando' | 'completada' | 'fallida';
  puntuacion_total?: number;
  puntuacion_maxima: number;
  porcentaje_acierto?: number;
  clasificacion?: string;
  confianza?: number;
  tiempo_procesamiento?: number;
  tiempo_dibujo?: number;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  observaciones?: string;
}

export interface ResultadoCDT {
  success: boolean;
  evaluacion: EvaluacionCDT;
  criterios?: CriterioEvaluacion[];
  imagen_path?: string;
}

export interface CriterioEvaluacion {
  dominio_cognitivo: string;
  subcriterio: string;
  puntuacion_obtenida: number;
  puntuacion_maxima: number;
  observaciones?: string;
}

export interface AppState {
  codigo: string;
  codigoValido: boolean;
  paciente?: CodigoAcceso['paciente'];
  evaluacion?: EvaluacionCDT;
  id_evaluacion?: number;
  imagen?: string;
  tiempoDibujo: number;
  cronometroActivo: boolean;
  cargando: boolean;
  error?: string;
  instrucciones?: string;
  tiempo_limite?: number;
}

export type RootStackParamList = {
  CodigoScreen: undefined;
  PreparacionScreen: undefined;
  DibujoScreen: undefined;
  CamaraScreen: undefined;
  PreviewScreen: { imagenUri: string };
  ProcesandoScreen: undefined;
  ResultadosScreen: undefined;
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
