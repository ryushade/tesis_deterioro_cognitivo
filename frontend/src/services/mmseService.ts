import { apiClient } from './api';

const RESOURCE = '/evaluacion/mmse';

export const mmseService = {
  async getSession(id: number) {
    const { data } = await apiClient.get(`${RESOURCE}/sesion/${id}`);
    return data;
  },
  
  async getSesionesPaciente(id_paciente: number) {
    const { data } = await apiClient.get(`${RESOURCE}/paciente/${id_paciente}`);
    return data;
  },

  async createSession(id_paciente: number, id_codigo: number) {
    const { data } = await apiClient.post(`${RESOURCE}/crear`, { id_paciente, id_codigo });
    return data;
  },

  async updateProgress(id_evaluacion: number, datos_especificos: any, puntuacion: number, estado_procesamiento: string) {
    const { data } = await apiClient.put(`${RESOURCE}/progreso/${id_evaluacion}`, {
      datos_especificos,
      puntuacion,
      estado_procesamiento
    });
    return data;
  },

  async finalize(id_evaluacion: number, payload: { puntuacion_total: number; datos_especificos: any }) {
    const { data } = await apiClient.put(`${RESOURCE}/finalizar/${id_evaluacion}`, payload);
    return data;
  }
};
