import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { PruebaCognitiva } from '../../../types/evaluaciones';

interface Props {
  pruebas: PruebaCognitiva[];
  loading: boolean;
  onView: (prueba: PruebaCognitiva) => void;
  onEdit: (prueba: PruebaCognitiva) => void;
  onDelete: (prueba: PruebaCognitiva) => void;
}

function formatFecha(fecha: string) {
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return fecha;
  }
}

export function PruebasCognitivasTable({ pruebas, loading, onView, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando evaluaciones...</p>
        </div>
      ) : pruebas.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No se encontraron pruebas cognitivas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntaje máximo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modo de aplicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ESTADO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actualizado en
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pruebas.map((prueba) => (
                <tr key={prueba.id_prueba} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prueba.codigo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prueba.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prueba.puntaje_maximo != null ? Number(prueba.puntaje_maximo).toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{prueba.modo_aplicacion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${prueba.activo ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}`}>
                      {prueba.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatFecha(prueba.actualizado_en)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">

                        <Eye className="h-4 w-4 cursor-pointer text-blue-600 hover:text-blue-700" title="Ver" onClick={() => onView(prueba)} />

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

