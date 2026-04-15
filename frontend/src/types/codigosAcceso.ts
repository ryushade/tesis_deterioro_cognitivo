// Tipos para códigos de acceso

export type EstadoCodigo = 0 | 1 | 2 | 3;

export type TipoEvaluacion = 'CDT' | 'MMSE' | 'MOCA' | 'ACE';

export interface CodigoAcceso {
  id_codigo: number;
  codigo: string;
  id_paciente: number;
  nombre_paciente: string;
  nombres: string;
  nombre_prueba: string;
  apellidos: string;
  tipo_evaluacion: TipoEvaluacion;
  vence_at: string;
  estado: EstadoCodigo;
  creado_en: string;
  ultimo_uso_en?: string;
  esta_vencido: boolean;
  horas_restantes: number;
}

export interface CodigoAccesoCreate {
  id_paciente: number;
  tipo_evaluacion: TipoEvaluacion;
  vence_at?: string;
  estado?: EstadoCodigo;
  dias_vencimiento?: number;
  codigo?: string;
}

export interface CodigoAccesoUpdate {
  tipo_evaluacion?: TipoEvaluacion;
  vence_at?: string;
  estado?: EstadoCodigo;
}

export interface EstadisticasCodigos {
  total: number;
  emitidos: number;
  usados: number;
  vencidos: number;
  revocados: number;
  vencidos_pendientes: number;
  cdt: number;
  mmse: number;
  moca: number;
  ace: number;
}

export interface CodigoAccesoResponse {
  success: boolean;
  data?: CodigoAcceso;
  message?: string;
}

export interface CodigoAccesoListResponse {
  success: boolean;
  data: CodigoAcceso[];
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

export interface EstadisticasResponse {
  success: boolean;
  data?: EstadisticasCodigos;
  message?: string;
}

export interface GenerarCodigoResponse {
  success: boolean;
  data?: {
    codigo: string;
  };
  message?: string;
}

export interface CodigoAccesoFilters {
  search?: string;
  estado?: EstadoCodigo | '';
  tipo_evaluacion?: TipoEvaluacion | '';
  id_paciente?: number;
  page?: number;
  limit?: number;
}

// Opciones para selects
export const ESTADOS_CODIGO: { value: EstadoCodigo; label: string; color: string }[] = [
  { value: 1, label: 'Pendiente',    color: 'bg-purple-100 text-purple-700' },
  { value: 3, label: 'En progreso',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 2, label: 'Completado',   color: 'bg-green-100 text-green-700' },
  { value: 0, label: 'Cancelado',    color: 'bg-gray-100 text-gray-700' }
];

export const TIPOS_EVALUACION: { value: TipoEvaluacion; label: string; description: string }[] = [
  { value: 'CDT', label: 'CDT', description: 'Clock Drawing Test' },
  { value: 'MMSE', label: 'MMSE', description: 'Mini Mental State Examination' },
  { value: 'MOCA', label: 'MoCA', description: 'Montreal Cognitive Assessment' },
  { value: 'ACE', label: 'ACE', description: 'Addenbrooke\'s Cognitive Examination' }
];

// Utilidades para códigos de acceso
export const getEstadoColor = (estado: EstadoCodigo): string => {
  const estadoInfo = ESTADOS_CODIGO.find(e => e.value === estado);
  return estadoInfo?.color || 'bg-gray-100 text-gray-800';
};

export const getEstadoLabel = (estado: EstadoCodigo): string => {
  const estadoInfo = ESTADOS_CODIGO.find(e => e.value === estado);
  return estadoInfo?.label || 'Desconocido';
};

export const getTipoEvaluacionLabel = (tipo: TipoEvaluacion): string => {
  const tipoInfo = TIPOS_EVALUACION.find(t => t.value === tipo);
  return tipoInfo?.label || tipo;
};

export const getTipoEvaluacionDescription = (tipo: TipoEvaluacion): string => {
  const tipoInfo = TIPOS_EVALUACION.find(t => t.value === tipo);
  return tipoInfo?.description || tipo;
};

export const formatearTiempoRestante = (horas: number): string => {
  if (horas <= 0) return 'Vencido';
  
  const dias = Math.floor(horas / 24);
  const horasRestantes = Math.floor(horas % 24);
  
  if (dias > 0) {
    return `${dias}d ${horasRestantes}h`;
  } else {
    return `${horasRestantes}h`;
  }
};

export const esCodigoVencido = (codigo: CodigoAcceso): boolean => {
  return codigo.esta_vencido || new Date(codigo.vence_at) < new Date();
};

export const puedeUsarseCodigo = (codigo: CodigoAcceso): boolean => {
  return codigo.estado === 1 && !esCodigoVencido(codigo);
};
