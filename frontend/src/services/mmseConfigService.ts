/**
 * Servicio para gestión de configuración de respuestas correctas del MMSE
 */

export interface MMSEConfiguracion {
  id_configuracion: number
  id_prueba: number
  pregunta_id: string
  respuesta_correcta: string
  contexto?: string
  tipo_validacion: 'exacta' | 'parcial' | 'fuzzy'
  tolerancia_errores: number
  puntuacion: number
  es_activa: boolean
  orden: number
  creado_en: string
  actualizado_en: string
  nombre_prueba?: string
  codigo_prueba?: string
}

export interface ValidationResult {
  is_valid: boolean
  score: number
  message: string
  suggestions: string[]
}

export interface CreateConfiguracionRequest {
  pregunta_id: string
  respuesta_correcta: string
  contexto?: string
  tipo_validacion?: 'exacta' | 'parcial' | 'fuzzy'
  tolerancia_errores?: number
  puntuacion?: number
  es_activa?: boolean
  orden?: number
}

export interface UpdateConfiguracionRequest extends Partial<CreateConfiguracionRequest> {}

export interface ValidateAnswerRequest {
  pregunta_id: string
  respuesta: string
  contexto?: string
}

export class MMSEConfigService {
  private baseUrl = '/api/mmse/configuracion'

  /**
   * Obtiene todas las configuraciones de respuestas correctas
   */
  async getConfiguraciones(
    preguntaId?: string, 
    contexto?: string
  ): Promise<{ success: boolean; data: MMSEConfiguracion[]; count: number }> {
    const params = new URLSearchParams()
    if (preguntaId) params.append('pregunta_id', preguntaId)
    if (contexto) params.append('contexto', contexto)
    
    try {
      const response = await fetch(`${this.baseUrl}/respuestas?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error in getConfiguraciones:', error)
      throw error
    }
  }

  /**
   * Obtiene una configuración específica por ID
   */
  async getConfiguracion(id: number): Promise<{ success: boolean; data: MMSEConfiguracion }> {
    const response = await fetch(`${this.baseUrl}/respuestas/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Crea una nueva configuración
   */
  async createConfiguracion(data: CreateConfiguracionRequest): Promise<{ success: boolean; data: { id_configuracion: number } }> {
    const response = await fetch(`${this.baseUrl}/respuestas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Actualiza una configuración existente
   */
  async updateConfiguracion(id: number, data: UpdateConfiguracionRequest): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/respuestas/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Elimina una configuración
   */
  async deleteConfiguracion(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/respuestas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Obtiene configuraciones para validación en tiempo real
   */
  async getConfiguracionForValidation(
    preguntaId: string, 
    contexto?: string
  ): Promise<{ success: boolean; data: MMSEConfiguracion[] }> {
    const params = new URLSearchParams()
    if (contexto) params.append('contexto', contexto)
    
    const response = await fetch(`${this.baseUrl}/validacion/${preguntaId}?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Valida una respuesta del usuario contra las configuraciones
   */
  async validateAnswer(data: ValidateAnswerRequest): Promise<{ success: boolean; data: ValidationResult }> {
    const response = await fetch(`${this.baseUrl}/validar-respuesta`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Obtiene lista de contextos disponibles
   */
  async getContextos(): Promise<{ success: boolean; data: string[] }> {
    const response = await fetch(`${this.baseUrl}/contextos`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Obtiene lista de preguntas disponibles
   */
  async getPreguntas(): Promise<{ success: boolean; data: string[] }> {
    const response = await fetch(`${this.baseUrl}/preguntas`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }
}

// Instancia singleton del servicio
export const mmseConfigService = new MMSEConfigService()
