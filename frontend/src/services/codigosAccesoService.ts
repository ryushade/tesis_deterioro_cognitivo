import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  CodigoAccesoCreate, 
  CodigoAccesoUpdate, 
  CodigoAccesoListResponse, 
  CodigoAccesoResponse,
  EstadisticasResponse,
  GenerarCodigoResponse,
  CodigoAccesoFilters 
} from '@/types/codigosAcceso';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Servicios API
const codigosAccesoApi = {
  // Obtener lista de códigos de acceso
  getAll: async (filters: CodigoAccesoFilters = {}): Promise<CodigoAccesoListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.tipo_evaluacion) params.append('tipo_evaluacion', filters.tipo_evaluacion);
    if (filters.id_paciente) params.append('id_paciente', filters.id_paciente.toString());
    
    const response = await fetch(`${API_BASE_URL}/codigos-acceso?${params}`);
    if (!response.ok) {
      throw new Error('Error al obtener códigos de acceso');
    }
    return response.json();
  },

  // Obtener código de acceso por ID
  getById: async (id: number): Promise<CodigoAccesoResponse> => {
    const response = await fetch(`${API_BASE_URL}/codigos-acceso/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener código de acceso');
    }
    return response.json();
  },

  // Crear nuevo código de acceso
  create: async (data: CodigoAccesoCreate): Promise<CodigoAccesoResponse> => {
    const response = await fetch(`${API_BASE_URL}/codigos-acceso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear código de acceso');
    }
    return response.json();
  },

  // Actualizar código de acceso
  update: async (id: number, data: CodigoAccesoUpdate): Promise<CodigoAccesoResponse> => {
    const response = await fetch(`${API_BASE_URL}/codigos-acceso/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar código de acceso');
    }
    return response.json();
  },

  // Eliminar código de acceso
  delete: async (id: number): Promise<CodigoAccesoResponse> => {
    const response = await fetch(`${API_BASE_URL}/codigos-acceso/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar código de acceso');
    }
    return response.json();
  },

  // Revocar código de acceso
  revocar: async (id: number): Promise<CodigoAccesoResponse> => {
    const response = await fetch(`${API_BASE_URL}/codigos-acceso/${id}/revocar`, {
      method: 'POST',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al revocar código de acceso');
    }
    return response.json();
  },

  // Marcar código como usado
  marcarComoUsado: async (codigo: string): Promise<CodigoAccesoResponse> => {
    const response = await fetch(`${API_BASE_URL}/codigos-acceso/usar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codigo }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al marcar código como usado');
    }
    return response.json();
  },

  // Obtener estadísticas
  getEstadisticas: async (): Promise<EstadisticasResponse> => {
    const response = await fetch(`${API_BASE_URL}/codigos-acceso/estadisticas`);
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }
    return response.json();
  },

  // Generar código único
  generarCodigo: async (longitud: number = 8): Promise<GenerarCodigoResponse> => {
    const response = await fetch(`${API_BASE_URL}/codigos-acceso/generar-codigo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ longitud }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al generar código');
    }
    return response.json();
  },
};

// Hooks de React Query

// Hook para obtener lista de códigos de acceso
export const useGetCodigosAcceso = (filters: CodigoAccesoFilters = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['codigosAcceso', filters],
    queryFn: () => codigosAccesoApi.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    codigosAcceso: data?.data || [],
    metadata: data?.metadata || {
      total: 0,
      page: 1,
      limit: 10,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    },
    loading: isLoading,
    error: error?.message,
    refetch: (newFilters?: CodigoAccesoFilters) => {
      if (newFilters) {
        // Si se proporcionan nuevos filtros, actualizar la query
        return refetch();
      }
      return refetch();
    },
  };
};

// Hook para obtener código de acceso por ID
export const useGetCodigoAcceso = (id: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['codigoAcceso', id],
    queryFn: () => codigosAccesoApi.getById(id),
    enabled: !!id,
  });

  return {
    codigoAcceso: data?.data,
    loading: isLoading,
    error: error?.message,
  };
};

// Hook para obtener estadísticas
export const useGetEstadisticasCodigos = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['estadisticasCodigos'],
    queryFn: codigosAccesoApi.getEstadisticas,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return {
    estadisticas: data?.data,
    loading: isLoading,
    error: error?.message,
    refetch,
  };
};

// Hook para crear código de acceso
export const useCreateCodigoAcceso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: codigosAccesoApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codigosAcceso'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticasCodigos'] });
    },
  });
};

// Hook para actualizar código de acceso
export const useUpdateCodigoAcceso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CodigoAccesoUpdate }) =>
      codigosAccesoApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['codigosAcceso'] });
      queryClient.invalidateQueries({ queryKey: ['codigoAcceso', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['estadisticasCodigos'] });
    },
  });
};

// Hook para eliminar código de acceso
export const useDeleteCodigoAcceso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: codigosAccesoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codigosAcceso'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticasCodigos'] });
    },
  });
};

// Hook para revocar código de acceso
export const useRevocarCodigoAcceso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: codigosAccesoApi.revocar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codigosAcceso'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticasCodigos'] });
    },
  });
};

// Hook para marcar código como usado
export const useMarcarCodigoUsado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: codigosAccesoApi.marcarComoUsado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codigosAcceso'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticasCodigos'] });
    },
  });
};

// Hook para generar código único
export const useGenerarCodigo = () => {
  return useMutation({
    mutationFn: codigosAccesoApi.generarCodigo,
  });
};

// Exportar el servicio principal
export const codigosAccesoService = codigosAccesoApi;
