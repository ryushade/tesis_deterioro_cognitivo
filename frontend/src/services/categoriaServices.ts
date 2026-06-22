import api from './api';

export interface Categoria {
  id_categoria: number;
  id_prueba?: number;
  nombre_categoria: string;
  puntaje_maximo: number;
  estado: number;
  total_secciones?: number;
  total_items_configurados?: number;
}

export interface MMSEEstructura {
  id_prueba: number;
  nombre_prueba: string;
  puntaje_maximo: number;
  categorias: {
    id_categoria: number;
    nombre_categoria: string;
    puntaje_maximo: number;
    secciones: {
      id_seccion: number;
      nombre_seccion: string;
      descripcion: string;
      instrucciones_aplicacion: string;
      puntaje_maximo: number;
      opciones: {
        id_opcion: number;
        nombre_opcion: string;
        instrucciones: string;
        puntaje_maximo: number;
        items: {
          id_item: number;
          texto_item: string;
          criterio_correccion: string;
          respuesta_esperada: string;
          puntaje_maximo: number;
        }[];
      }[];
    }[];
  }[];
}

export const categoriaServices = {
  // Obtener todas las categorias
  getAll: async (): Promise<{ success: boolean; data?: Categoria[]; message?: string }> => {
    try {
      const response = await api.get('/mmse/categorias');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al obtener categorías' };
    }
  },

  // Obtener estructura completa
  getEstructura: async (): Promise<{ success: boolean; data?: MMSEEstructura; message?: string }> => {
    try {
      const response = await api.get('/mmse/estructura');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al obtener estructura' };
    }
  },

  // Crear categoría (solo Administrador)
  create: async (data: Omit<Categoria, 'id_categoria'>): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.post('/mmse/categorias', data);
      return { success: true, message: 'Categoría creada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al crear categoría' };
    }
  },

  // Actualizar categoría (solo Administrador)
  update: async (id: number, data: Partial<Categoria>): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.put(`/mmse/categorias/${id}`, data);
      return { success: true, message: 'Categoría actualizada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al actualizar categoría' };
    }
  },

  // Eliminar categoría (soft-delete, solo Administrador)
  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`/mmse/categorias/${id}`);
      return { success: true, message: 'Categoría eliminada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al eliminar categoría' };
    }
  },

  // Validar coherencia de puntajes de la estructura (no bloqueante)
  validarEstructura: async (): Promise<{ success: boolean; data?: { coherente: boolean; total_prueba: number; suma_categorias: number; advertencias: string[] }; message?: string }> => {
    try {
      const response = await api.get('/mmse/validar-estructura');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al validar estructura' };
    }
  },
};

// ---- CRUD de secciones / opciones / ítems (solo Administrador) ----
// Disponible para el editor detallado de la estructura (siguiente incremento de UI).
export const seccionServices = {
  create: (data: Record<string, unknown>) => api.post('/mmse/secciones', data).then(r => r.data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/mmse/secciones/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/mmse/secciones/${id}`).then(r => r.data),
};

export const opcionServices = {
  create: (data: Record<string, unknown>) => api.post('/mmse/opciones', data).then(r => r.data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/mmse/opciones/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/mmse/opciones/${id}`).then(r => r.data),
};

export const itemServices = {
  create: (data: Record<string, unknown>) => api.post('/mmse/items', data).then(r => r.data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/mmse/items/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/mmse/items/${id}`).then(r => r.data),
};
