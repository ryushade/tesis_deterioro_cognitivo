import { useEffect, useState } from 'react'
import { apiClient } from './api'

// Rutas base según lo revelado en el backend
const RESOURCE = '/auth/obtener_pruebas'

export interface Prueba {
  id_prueba: number;
  nombre_prueba: string;
  puntaje_maximo: number | null;
  estado: number;
  
  // Campos opcionales por si tu frontend los envía/espera
  codigo?: string;
  descripcion?: string;
  modo_aplicacion?: string;
}

export interface PruebasResponse {
  success: boolean
  data: Prueba[]
  metadata: {
    total: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  message?: string
}

export interface PruebaResponse {
  success: boolean
  data?: Prueba
  message: string
}

export interface PruebaCreate {
  nombre_prueba: string;
  puntaje_maximo?: number;
  estado?: number;
  
  // Campos opcionales por si los agregas a la Base de Datos a futuro
  codigo?: string;
  descripcion?: string;
  modo_aplicacion?: string;
}

export interface PruebaUpdate extends Partial<PruebaCreate> {}

export function useGetPruebas() {
  const [pruebas, setPruebas] = useState<Prueba[]>([])
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    limit: 5,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPruebasSafe = async (
    page: number = 1,
    limit: number = 5,
    search: string = '',
    includeInactive: boolean = true,
  ) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.get<PruebasResponse>(RESOURCE, {
        params: { page, limit, ...(search ? { search } : {}), ...(includeInactive ? { include_inactive: true } : {}) },
      })
      if (data?.success) {
        setPruebas(data.data || [])
        if (data.metadata) {
          setMetadata(data.metadata)
        }
        return
      }
    } catch (e) {
      setError('Error al cargar la lista de pruebas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPruebasSafe(1, 5)
  }, [])

  return { pruebas, metadata, loading, error, refetch: fetchPruebasSafe, setPruebas }
}

export const pruebasService = {
  async getAll(page = 1, limit = 10, search = '', includeInactive = true): Promise<PruebasResponse> {
    const { data } = await apiClient.get<PruebasResponse>(RESOURCE, {
      params: { page, limit, ...(search ? { search } : {}), ...(includeInactive ? { include_inactive: true } : {}) },
    })
    return data
  },
  async getById(id: number): Promise<PruebaResponse> {
    const { data } = await apiClient.get<PruebaResponse>(`${RESOURCE}/${id}`)
    return data
  },
  async create(payload: PruebaCreate): Promise<PruebaResponse> {
    // Apunta al endpoint exacto que crees en __init__.py. Si se llama distinto, ajústalo aquí.
    const { data } = await apiClient.post<PruebaResponse>('/auth/registrar_pruebas', payload)
    return data
  },
  async update(id: number, payload: PruebaUpdate): Promise<PruebaResponse> {
    const { data } = await apiClient.put<PruebaResponse>(`${RESOURCE}/${id}`, payload)
    return data
  },
  async delete(id: number): Promise<PruebaResponse> {
    const { data } = await apiClient.delete<PruebaResponse>(`${RESOURCE}/${id}`)
    return data
  },
}
