import api from './api';
import { useState, useEffect, useCallback } from 'react';

export interface Paciente {
  id_paciente: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  fecha_nacimiento: string;
  edad?: number;
  telefono: string;
  direccion: string;
  contacto_emergencia: string;
  telefono_emergencia: string;
  estado_cognitivo: string;
  medicamentos: string;
  estado_paciente: string | number;
  fecha_registro?: string;
  fecha_actualizacion?: string;
  sexo?: string;
  escolaridad?: string;
  anos_escolaridad?: number;
  nombre_completo?: string;
  sexo_display?: string;
  estado?: boolean;
}

export type PacienteUpdate = Partial<Paciente>;

export interface PacienteResponse {
  success: boolean;
  message: string;
  data?: Paciente;
  pacientes?: Paciente[];
}

export const pacientesService = {
  // Obtener todos los pacientes
  getAll: async (page = 1, limit = 10, search = ''): Promise<{ data: Paciente[], total: number }> => {
    try {
      const response = await api.get(`/pacientes`, { params: { page, limit, search } });
      return { data: response.data.pacientes || [], total: response.data.total || 0 };
    } catch (error: any) {
      console.error('Error al obtener pacientes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener la lista de pacientes');
    }
  },
  
  getAllPacientes: async (): Promise<Paciente[]> => {
    try {
      const response = await api.get('/pacientes');
      return response.data.pacientes || [];
    } catch (error: any) {
      console.error('Error al obtener pacientes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener la lista de pacientes');
    }
  },

  // Obtener paciente por ID
  getById: async (id: number): Promise<Paciente> => {
    try {
      const response = await api.get(`/pacientes/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener paciente:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener la información del paciente');
    }
  },

  // Crear nuevo paciente
  create: async (pacienteData: Omit<Paciente, 'id_paciente' | 'fecha_registro' | 'fecha_actualizacion'>): Promise<Paciente> => {
    try {
      const response = await api.post('/pacientes', pacienteData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear paciente:', error);
      throw new Error(error.response?.data?.message || 'Error al registrar el paciente');
    }
  },

  // Actualizar paciente existente
  update: async (id: number, pacienteData: Partial<Paciente>): Promise<Paciente> => {
    try {
      const response = await api.put(`/pacientes/${id}`, pacienteData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar paciente:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar la información del paciente');
    }
  },

  // Eliminar paciente (cambiar estado a inactivo)
  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete(`/pacientes/${id}`);
      return response.data.success;
    } catch (error: any) {
      console.error('Error al eliminar paciente:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar el paciente');
    }
  },

  // Buscar pacientes por término
  searchPacientes: async (searchTerm: string): Promise<Paciente[]> => {
    try {
      const response = await api.get(`/pacientes/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data.pacientes || [];
    } catch (error: any) {
      console.error('Error al buscar pacientes:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar pacientes');
    }
  },

  // Obtener pacientes por estado cognitivo
  getPacientesByEstadoCognitivo: async (estado: string): Promise<Paciente[]> => {
    try {
      const response = await api.get(`/pacientes/estado-cognitivo/${estado}`);
      return response.data.pacientes || [];
    } catch (error: any) {
      console.error('Error al obtener pacientes por estado cognitivo:', error);
      throw new Error(error.response?.data?.message || 'Error al filtrar pacientes por estado cognitivo');
    }
  },

  // Obtener estadísticas de pacientes
  getEstadisticasPacientes: async () => {
    try {
      const response = await api.get('/pacientes/estadisticas');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de pacientes');
    }
  },

  // Activar/Desactivar paciente
  toggleEstadoPaciente: async (id: number, estado: number): Promise<Paciente> => {
    try {
      const response = await api.patch(`/pacientes/${id}/estado`, { estado_paciente: estado });
      return response.data.data;
    } catch (error: any) {
      console.error('Error al cambiar estado del paciente:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar el estado del paciente');
    }
  }
};

export default pacientesService;

export const NIVELES_EDUCATIVOS = [
  "Ninguno",
  "Primaria",
  "Secundaria",
  "Bachillerato",
  "Técnico",
  "Universitario",
  "Posgrado"
];

export const useGetPacientes = (initialPage = 1, initialLimit = 5) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [metadata, setMetadata] = useState<any>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = useCallback(async (page = initialPage, limit = initialLimit, search = '') => {
    try {
      setLoading(true);
      setError(null);
      let data: Paciente[] = [];
      if (search) {
        data = await pacientesService.searchPacientes(search);
      } else {
        data = await pacientesService.getAllPacientes();
      }
      
      const total = data.length;
      const totalPages = Math.ceil(total / limit);
      const startIdx = (page - 1) * limit;
      const paginatedData = data.slice(startIdx, startIdx + limit);

      setPacientes(paginatedData);
      setMetadata({
        total,
        page,
        limit,
        totalPages
      });
    } catch (err: any) {
      setError(err.message || 'Error fetch pacientes');
    } finally {
      setLoading(false);
    }
  }, [initialPage, initialLimit]);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  return { pacientes, metadata, loading, error, refetch: fetchPacientes };
};
