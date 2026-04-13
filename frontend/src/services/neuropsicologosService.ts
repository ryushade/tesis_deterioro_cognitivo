import { useEffect, useState } from 'react'
import { apiClient } from './api'

const RESOURCE = '/auth/obtener_neuropsicologo'

export interface Neuropsicologo {
  id_usuario: number;
  id_rol: number;
  usua: string;
  contra: string;
  estado_usuario: number;
}

export interface NeuropsicologoCreate {
  nombres: string
  apellidos: string
  username: string
  estado?: boolean
}

export interface NeuropsicologoUpdate {
  nombres?: string
  apellidos?: string
  username?: string
  estado?: boolean
}

export interface NeuropsicologosResponse {
  success: boolean
  data: Neuropsicologo[]
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

export interface NeuropsicologoResponse {
  success: boolean
  data?: Neuropsicologo
  message: string
}

export function useGetNeuropsicologos() {
  const [neuropsicologos, setNeuropsicologos] = useState<Neuropsicologo[]>([])
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



  // Fallback-aware fetch: intenta /neuropsicologos y si no existe usa /users?role_id=3
  const fetchNeuropsicologosSafe = async (
    page: number = 1,
    limit: number = 5,
    search: string = '',
    includeInactive: boolean = true,
  ) => {
    try {
      setLoading(true)
      setError(null)
      try {
        const { data } = await apiClient.get<NeuropsicologosResponse>(RESOURCE, {
          params: { page, limit, ...(search ? { search } : {}), ...(includeInactive ? { include_inactive: true } : {}) },
        })
        if (data?.success) {
          setNeuropsicologos(data.data || [])
          setMetadata(data.metadata)
          return
        }
      } catch (err) {
        // Fallback a endpoint placeholder disponible en backend
        const { data } = await apiClient.get<any>('/users-db', { params: { page, limit, ...(search ? { search } : {}) } })
        const mapped: Neuropsicologo[] = (data?.data || []).map((u: any) => ({
          id_neuropsicologo: u.id ?? u.id_usuario ?? 0,
          nombres: u.nombres ?? u.name ?? u.usua ?? '',
          apellidos: u.apellidos ?? '',
          username: u.username ?? u.usua ?? u.name ?? '',
          email: u.email ?? '',
          estado: u.estado ?? true,
          fecha_registro: u.createdAt ?? u.fecha_registro,
        }))
        setNeuropsicologos(mapped)
        setMetadata({
          total: data?.total ?? mapped.length,
          page: data?.page ?? page,
          limit: data?.limit ?? limit,
          total_pages: data?.totalPages ?? Math.ceil((data?.total ?? mapped.length) / (data?.limit ?? limit)),
          has_next: (data?.page ?? page) < (data?.totalPages ?? 1),
          has_prev: (data?.page ?? page) > 1,
        })
      }
    } catch (e) {
      setError('Error al cargar neuropsicólogos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNeuropsicologosSafe(1, 5)
  }, [])

  return { neuropsicologos, metadata, loading, error, refetch: fetchNeuropsicologosSafe, setNeuropsicologos }
}

export const neuropsicologosService = {
  async getAll(page = 1, limit = 10, search = '', includeInactive = true): Promise<NeuropsicologosResponse> {
    const { data } = await apiClient.get<NeuropsicologosResponse>(RESOURCE, {
      params: { page, limit, ...(search ? { search } : {}), ...(includeInactive ? { include_inactive: true } : {}) },
    })
    return data
  },
  async getById(id: number): Promise<NeuropsicologoResponse> {
    const { data } = await apiClient.get<NeuropsicologoResponse>(`${RESOURCE}/${id}`)
    return data
  },
  async create(payload: NeuropsicologoCreate): Promise<NeuropsicologoResponse> {
    const { data } = await apiClient.post<NeuropsicologoResponse>(RESOURCE, payload)
    return data
  },
  async update(id: number, payload: NeuropsicologoUpdate): Promise<NeuropsicologoResponse> {
    const { data } = await apiClient.put<NeuropsicologoResponse>(`${RESOURCE}/${id}`, payload)
    return data
  },
  async delete(id: number): Promise<NeuropsicologoResponse> {
    const { data } = await apiClient.delete<NeuropsicologoResponse>(`/auth/eliminar_neuropsicologo/${id}`)
    return data
  },
  async restore(id: number): Promise<NeuropsicologoResponse> {
    const { data } = await apiClient.post<NeuropsicologoResponse>(`${RESOURCE}/${id}/restore`)
    return data
  },
}


