import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { Prueba } from '../../../services/pruebaServices';

interface Props {
  pruebas: Prueba[];
  loading: boolean;
  onView: (prueba: Prueba) => void;
  onEdit: (prueba: Prueba) => void;
  onDelete: (prueba: Prueba) => void;
}

export function PruebasCognitivasTable({ pruebas, loading, onView, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando pruebas...</p>
        </div>
      ) : pruebas.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No se encontraron pruebas neuropsicológicas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CÓDIGO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOMBRE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PUNTAJE MAXIMO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ESTADO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pruebas.map((prueba) => (
                <tr key={prueba.id_prueba} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">PRB-{prueba.id_prueba}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prueba.nombre_prueba}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prueba.puntaje_maximo != null ? Number(prueba.puntaje_maximo).toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${prueba.estado === 1 ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}`}>
                      {prueba.estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onView(prueba)} className="text-gray-600 hover:text-gray-800">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(prueba)} className="text-gray-600 hover:text-gray-800">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(prueba)} className="text-red-600 hover:text-red-800">
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

export default PruebasCognitivasTable;
