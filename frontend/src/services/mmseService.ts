import { apiClient } from './api'

export interface MMSESession {
  id_sesion: number
  id_paciente: number
  id_prueba: number
  id_codigo?: number
  estado: string
  progreso: number
  iniciado_en?: string
  actualizado_en?: string
  tiempo_info?: {
    iniciado_en: string
    tiempo_transcurrido_segundos: number
    tiempo_restante_segundos: number
    duracion_total_minutos: number
  }
}

export const mmseService = {
  async createSession(id_paciente: number, id_codigo?: number): Promise<{ success: boolean; sesion_id?: number; message?: string }> {
    const { data } = await apiClient.post('/mmse/sesiones', { id_paciente, id_codigo })
    return data
  },
  
  async getSession(id: number): Promise<{ success: boolean; data?: MMSESession; message?: string }> {
    const { data } = await apiClient.get(`/mmse/sesiones/${id}`)
    return data
  },
  
  async updateProgress(id: number, progreso: number, estado?: string): Promise<{ success: boolean; tiempo_agotado?: boolean; message?: string }> {
    const { data } = await apiClient.patch(`/mmse/sesiones/${id}/progreso`, { progreso, estado })
    return data
  },
  
  async finalize(id: number, payload: { puntuacion_total: number; clasificacion?: string; datos_especificos?: any }): Promise<{ success: boolean; id_evaluacion?: number }> {
    const { data } = await apiClient.post(`/mmse/sesiones/${id}/finalizar`, payload)
    return data
  },
  
  async pausar(id: number): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/mmse/sesiones/${id}/pausar`)
    return data
  },
  
  async reanudar(id: number): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/mmse/sesiones/${id}/reanudar`)
    return data
  },
  
  async cancelar(id: number): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/mmse/sesiones/${id}/cancelar`)
    return data
  },
  
  async validarCodigo(codigo: string): Promise<{ success: boolean; data?: any; message?: string }> {
    const { data } = await apiClient.post('/codigos-acceso/validar', { codigo })
    return data
  },
}

