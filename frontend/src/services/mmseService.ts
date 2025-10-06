import { apiClient } from './api'

export interface MMSESession {
  id_evaluacion: number
  id_paciente: number
  tipo_evaluacion: 'MMSE'
  datos_especificos?: any
  puntuacion_total?: number
  actualizado_en?: string
}

export const mmseService = {
  async createSession(id_paciente: number, datos?: any): Promise<{ success: boolean; sesion_id?: number; message?: string }> {
    const { data } = await apiClient.post('/mmse/sesiones', { id_paciente, datos })
    return data
  },
  async getSession(id: number): Promise<{ success: boolean; data?: MMSESession; message?: string }> {
    const { data } = await apiClient.get(`/mmse/sesiones/${id}`)
    return data
  },
  async updateProgress(id: number, payload: { datos_especificos: any; puntuacion_total?: number; estado_procesamiento?: string }): Promise<{ success: boolean }> {
    const { data } = await apiClient.patch(`/mmse/sesiones/${id}/progreso`, payload)
    return data
  },
  async finalize(id: number, payload: { puntuacion_total: number; clasificacion?: string }): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/mmse/sesiones/${id}/finalizar`, payload)
    return data
  },
}

