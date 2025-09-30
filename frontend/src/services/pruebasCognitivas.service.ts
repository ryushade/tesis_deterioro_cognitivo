import type { PruebaCognitiva } from '@/types/evaluaciones';

const API_BASE_URL = 'http://127.0.0.1:5000/api/pruebas-cognitivas';

export type ModoAplicacion = 'papel' | 'digital';

export interface PruebaCognitivaFilters {
  page?: number;
  limit?: number;
  search?: string;
  modo_aplicacion?: ModoAplicacion;
  activo?: boolean;
}

export interface PruebasCognitivasListResponse {
  success: boolean;
  data: PruebaCognitiva[];
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

export interface PruebaCognitivaResponse {
  success: boolean;
  data?: PruebaCognitiva;
  message?: string;
}

export interface PruebaCognitivaCreate {
  codigo: string;
  nombre: string;
  puntaje_maximo?: number;
  modo_aplicacion?: ModoAplicacion; // default 'papel' en backend
  activo?: boolean; // default true en backend
}

export interface PruebaCognitivaUpdate {
  codigo?: string;
  nombre?: string;
  puntaje_maximo?: number;
  modo_aplicacion?: ModoAplicacion;
  activo?: boolean;
}

export const pruebasCognitivasService = {
  async getAll(filters: PruebaCognitivaFilters = {}): Promise<PruebasCognitivasListResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.search) params.append('search', filters.search);
    if (filters.modo_aplicacion) params.append('modo_aplicacion', filters.modo_aplicacion);
    if (typeof filters.activo === 'boolean') params.append('activo', filters.activo ? 'true' : 'false');

    const resp = await fetch(`${API_BASE_URL}?${params.toString()}`);
    return resp.json();
  },

  async getById(id: number): Promise<PruebaCognitivaResponse> {
    const resp = await fetch(`${API_BASE_URL}/${id}`);
    return resp.json();
  },

  async create(data: PruebaCognitivaCreate): Promise<PruebaCognitivaResponse> {
    const resp = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return resp.json();
  },

  async update(id: number, data: PruebaCognitivaUpdate): Promise<PruebaCognitivaResponse> {
    const resp = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return resp.json();
  },

  async delete(id: number): Promise<PruebaCognitivaResponse> {
    const resp = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    return resp.json();
  },

  async restore(id: number): Promise<PruebaCognitivaResponse> {
    const resp = await fetch(`${API_BASE_URL}/${id}/restore`, { method: 'POST' });
    return resp.json();
  },
};

export default pruebasCognitivasService;

