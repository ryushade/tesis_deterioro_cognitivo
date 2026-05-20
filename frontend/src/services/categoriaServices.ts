import api from './api';

export interface Categoria {
  id_categoria: number;
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

// In-memory mock data for frontend-only CRUD testing
let mockCategorias: Categoria[] = [
  { id_categoria: 1, id_prueba: 2, nombre_categoria: 'Orientación', puntaje_maximo: 10, estado: 1 },
  { id_categoria: 2, id_prueba: 2, nombre_categoria: 'Fijación', puntaje_maximo: 3, estado: 1 },
  { id_categoria: 3, id_prueba: 2, nombre_categoria: 'Atención y Cálculo', puntaje_maximo: 5, estado: 1 },
  { id_categoria: 4, id_prueba: 2, nombre_categoria: 'Memoria', puntaje_maximo: 3, estado: 1 },
  { id_categoria: 5, id_prueba: 2, nombre_categoria: 'Lenguaje y Praxis', puntaje_maximo: 9, estado: 1 },
];

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

  // Crear categoría
  create: async (data: Omit<Categoria, 'id_categoria'>): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = mockCategorias.length > 0 ? Math.max(...mockCategorias.map(c => c.id_categoria)) + 1 : 1;
        mockCategorias.push({ ...data, id_categoria: newId });
        resolve({ success: true, message: 'Categoría creada exitosamente' });
      }, 500);
    });

    /*
    // REAL API CALL
    try {
      const response = await api.post('/categorias', data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al crear categoría' };
    }
    */
  },

  // Actualizar categoría
  update: async (id: number, data: Partial<Categoria>): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockCategorias.findIndex(c => c.id_categoria === id);
        if (index !== -1) {
          mockCategorias[index] = { ...mockCategorias[index], ...data };
          resolve({ success: true, message: 'Categoría actualizada exitosamente' });
        } else {
          resolve({ success: false, message: 'Categoría no encontrada' });
        }
      }, 500);
    });

    /*
    // REAL API CALL
    try {
      const response = await api.put(`/categorias/${id}`, data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al actualizar categoría' };
    }
    */
  },

  // Eliminar categoría
  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockCategorias = mockCategorias.filter(c => c.id_categoria !== id);
        resolve({ success: true, message: 'Categoría eliminada exitosamente' });
      }, 500);
    });

    /*
    // REAL API CALL
    try {
      const response = await api.delete(`/categorias/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error al eliminar categoría' };
    }
    */
  }
};
