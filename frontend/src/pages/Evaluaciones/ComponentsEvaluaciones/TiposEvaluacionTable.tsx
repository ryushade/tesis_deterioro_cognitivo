import { Button } from '../../../components/ui/button';
import type { TipoEvaluacion } from '../../../types/evaluaciones';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface TiposEvaluacionTableProps {
  tiposEvaluacion: TipoEvaluacion[];
  loading: boolean;
  onView: (tipo: TipoEvaluacion) => void;
  onEdit: (tipo: TipoEvaluacion) => void;
  onDelete: (tipo: TipoEvaluacion) => void;
}

export function TiposEvaluacionTable({ 
  tiposEvaluacion, 
  loading, 
  onView, 
  onEdit, 
  onDelete 
}: TiposEvaluacionTableProps) {
  const formatFechaSimple = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando tipos de evaluación...</p>
        </div>
      ) : tiposEvaluacion.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No se encontraron tipos de evaluación</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tiposEvaluacion.map((tipo) => (
                <tr key={tipo.id_tipo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      #{tipo.id_tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {tipo.codigo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{tipo.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      {tipo.requiere_imagen && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Imagen
                        </span>
                      )}
                      {tipo.requiere_metodo && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          Método
                        </span>
                      )}
                      {!tipo.requiere_imagen && !tipo.requiere_metodo && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tipo.activo 
                        ? 'text-green-700 bg-green-100' 
                        : 'text-red-700 bg-red-100'
                    }`}>
                      {tipo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFechaSimple(tipo.creado_en)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-1">
                      <Button
                        onClick={() => onView(tipo)}
                        className="text-blue-600 bg-transparent border-none p-2 rounded hover:bg-blue-50"
                        title="Ver tipo"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onEdit(tipo)}
                        className="text-gray-600 bg-transparent border-none p-2 rounded hover:bg-gray-50"
                        title="Editar tipo"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onDelete(tipo)}
                        className="text-red-600 bg-transparent border-none p-2 rounded hover:bg-red-50"
                        title="Eliminar tipo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
