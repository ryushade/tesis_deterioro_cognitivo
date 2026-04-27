import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, LayoutList } from 'lucide-react';
import type { Categoria } from '@/services/categoriaServices';

interface TablaCategoriasProps {
  categorias: Categoria[];
  loading: boolean;
  searchTerm: string;
  onSearch: (term: string) => void;
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
}

export default function TablaCategorias({
  categorias,
  loading,
  searchTerm,
  onSearch: _onSearch,
  onEdit,
  onDelete,
}: TablaCategoriasProps) {
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
             
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Categoría
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntaje Máximo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>

            </tr>
            
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <LayoutList className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No se encontraron categorías</p>
                  {searchTerm && (
                    <p className="text-sm">
                      Intenta con otros términos de búsqueda
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              categorias.map((categoria) => (
                <tr key={categoria.id_categoria} className="hover:bg-gray-50">
                  
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {categoria.nombre_categoria}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {categoria.puntaje_maximo} puntos
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      categoria.estado === 1 ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'
                    }`}>
                      {categoria.estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(categoria)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCategoriaToDelete(categoria);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {categoriaToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-2">
          <div className="bg-white fixed left-[50%] top-[50%] z-[101] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-xl">
            <div className="flex flex-col space-y-1 text-center items-center mt-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100/80 text-red-600 mb-2">
                <Trash2 className="h-6 w-6" />
              </div>
              
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                ¿Eliminar categoría?
              </h2>
              <p className="text-[15px] pt-1 text-gray-600">
                Esto borrará permanentemente la categoría{" "}
                <span className="font-semibold text-gray-900">
                  {categoriaToDelete.nombre_categoria}
                </span>{" "}
                y toda su información asociada.
              </p>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setCategoriaToDelete(null)}
                className="mt-2 sm:mt-0"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDelete(categoriaToDelete);
                  setCategoriaToDelete(null);
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
