import { apiClient } from './api';
import type { CodigoAccesoListResponse, CodigoAccesoResponse, GenerarCodigoResponse, CodigoAccesoCreate } from '@/types/codigosAcceso';

const RESOURCE = '/auth/obtener_codigos';

export const codigosAccesoService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<CodigoAccesoListResponse> {
    const { data } = await apiClient.get<CodigoAccesoListResponse>(RESOURCE, {
      params: { 
        page: params?.page || 1, 
        limit: params?.limit || 10,
        search: params?.search || ''
      },
    });
    return data;
  },
  
  async getById(id: number): Promise<CodigoAccesoResponse> {
    const { data } = await apiClient.get<CodigoAccesoResponse>(`${RESOURCE}/${id}`);
    return data;
  },

  async create(payload: CodigoAccesoCreate): Promise<GenerarCodigoResponse> {
    const { data } = await apiClient.post<GenerarCodigoResponse>('/auth/generar_codigo', payload);
    return data;
  },

  async delete(id: number): Promise<CodigoAccesoResponse> {
    const { data } = await apiClient.delete<CodigoAccesoResponse>(`${RESOURCE}/${id}`);
    return data;
  }
};
