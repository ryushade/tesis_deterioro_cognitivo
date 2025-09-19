import axios from 'axios';
import { ApiResponse, CodigoAcceso, EvaluacionCDT, ResultadoCDT } from '@/types';

// Configuración base de la API
const API_BASE_URL = 'http://192.168.1.6:5000/api'; // IP local para testing con dispositivos móviles

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado. Verifica tu conexión a internet.');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Error interno del servidor. Intenta nuevamente.');
    }
    
    throw new Error(error.response?.data?.message || 'Error de conexión');
  }
);

export class CDTApiService {
  /**
   * Validar código de acceso
   */
  static async validarCodigo(codigo: string): Promise<CodigoAcceso> {
    try {
      const response = await api.post('/cdt/validar-codigo', {
        codigo: codigo.trim().toUpperCase(),
      });
      
      if (response.data.success) {
        // El backend devuelve los datos directamente, no en response.data.data
        return {
          codigo_valido: response.data.codigo_valido,
          instrucciones: response.data.instrucciones,
          tiempo_limite: response.data.tiempo_limite,
          paciente: response.data.paciente,
          evaluacion: response.data.evaluacion,
        };
      }
      
      throw new Error(response.data.error || 'Código no válido');
    } catch (error: any) {
      console.error('Error validando código:', error);
      throw new Error(error.response?.data?.error || error.message || 'Error al validar código');
    }
  }

  /**
   * Iniciar evaluación CDT
   */
  static async iniciarEvaluacion(codigo: string): Promise<{ id_evaluacion: number }> {
    try {
      const response = await api.post('/cdt/iniciar-evaluacion', {
        codigo: codigo.trim().toUpperCase(),
      });
      
      if (response.data.success) {
        return {
          id_evaluacion: response.data.evaluacion_id,
        };
      }
      
      throw new Error(response.data.error || 'Error al iniciar evaluación');
    } catch (error: any) {
      console.error('Error iniciando evaluación:', error);
      throw new Error(error.response?.data?.error || error.message || 'Error al iniciar evaluación');
    }
  }

  /**
   * Subir imagen y procesar evaluación
   */
  static async subirImagenCDT(
    idEvaluacion: number, 
    imagenUri: string, 
    _tiempoDibujo: number
  ): Promise<{ success: boolean; error?: string; evaluacion?: any; mensaje?: string }> {
    try {
      const formData = new FormData();
      
      // Agregar la imagen
      formData.append('file', {
        uri: imagenUri,
        type: 'image/jpeg',
        name: `cdt_${idEvaluacion}_${Date.now()}.jpg`,
      } as any);
      
      // Agregar el ID de evaluación
      formData.append('evaluacion_id', idEvaluacion.toString());
      
      const response = await api.post(
        `/cdt/subir-imagen`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 1 minuto para subida de imagen
        }
      );
      
      if (response.data.success) {
        return {
          success: true,
          evaluacion: response.data.evaluacion,
          mensaje: response.data.mensaje,
        };
      }
      
      throw new Error(response.data.error || 'Error al procesar imagen');
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error al subir imagen',
      };
    }
  }

  /**
   * Consultar estado de evaluación
   */
  static async consultarEvaluacion(idEvaluacion: number): Promise<EvaluacionCDT> {
    try {
      const response = await api.get(`/cdt/evaluation/${idEvaluacion}`);
      
      if (response.data.success) {
        return response.data.evaluation;
      }
      
      throw new Error(response.data.error || 'Evaluación no encontrada');
    } catch (error: any) {
      console.error('Error consultando evaluación:', error);
      throw new Error(error.response?.data?.error || error.message || 'Error al consultar evaluación');
    }
  }

  /**
   * Obtener resultados completos de evaluación
   */
  static async obtenerResultados(idEvaluacion: number): Promise<ResultadoCDT> {
    try {
      const response = await api.get<ApiResponse<ResultadoCDT>>(`/cdt/resultados/${idEvaluacion}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Resultados no disponibles');
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener resultados');
    }
  }

  /**
   * Verificar conectividad del backend
   */
  static async verificarConectividad(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      console.warn('No se puede conectar al backend:', error);
      return false;
    }
  }
}

export default CDTApiService;
