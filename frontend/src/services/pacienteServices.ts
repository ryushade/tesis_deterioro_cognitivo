import { useEffect, useState } from 'react'
import { apiClient } from './api'

const RESOURCE = '/auth/obtener_paciente'

export interface Paciente {
  id_paciente: number;
  id_usuario: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: string;
  escolaridad: string;
  estado: number;
}

// Renombrado a plural para los mapeos de lista
export interface PacientesResponse {
  success: boolean
  data: Paciente[]
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

export interface PacienteResponse {
  success: boolean
  data?: Paciente
  message: string
}

export interface PacienteCreate {
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo?: string;
  id_escolaridad: number | string;
  estado?: number;
}

export interface PacienteUpdate extends Partial<PacienteCreate> {}

export function useGetPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
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

  const fetchPacientesSafe = async (
    page: number = 1,
    limit: number = 5,
    search: string = '',
    includeInactive: boolean = true,
  ) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.get<PacientesResponse>(RESOURCE, {
        params: { page, limit, ...(search ? { search } : {}), ...(includeInactive ? { include_inactive: true } : {}) },
      })
      if (data?.success) {
        setPacientes(data.data || [])
        if (data.metadata) {
          setMetadata(data.metadata)
        }
        return
      }
    } catch (e) {
      setError('Error al cargar la lista de pacientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPacientesSafe(1, 5)
  }, [])

  return { pacientes, metadata, loading, error, refetch: fetchPacientesSafe, setPacientes }
}

export const pacientesService = {
  async getAll(page = 1, limit = 10, search = '', includeInactive = true): Promise<PacientesResponse> {
    const { data } = await apiClient.get<PacientesResponse>(RESOURCE, {
      params: { page, limit, ...(search ? { search } : {}), ...(includeInactive ? { include_inactive: true } : {}) },
    })
    return data
  },
  async getById(id: number): Promise<PacienteResponse> {
    const { data } = await apiClient.get<PacienteResponse>(`${RESOURCE}/${id}`)
    return data
  },
  async create(payload: PacienteCreate): Promise<PacienteResponse> {
    const { data } = await apiClient.post<PacienteResponse>(RESOURCE, payload)
    return data
  },
  async update(id: number, payload: PacienteUpdate): Promise<PacienteResponse> {
    const { data } = await apiClient.put<PacienteResponse>(`${RESOURCE}/${id}`, payload)
    return data
  },
  async delete(id: number): Promise<PacienteResponse> {
    const { data } = await apiClient.delete<PacienteResponse>(`${RESOURCE}/${id}`)
    return data
  },
  async restore(id: number): Promise<PacienteResponse> {
    const { data } = await apiClient.post<PacienteResponse>(`${RESOURCE}/${id}/restore`)
    return data
  },
}
