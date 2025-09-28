import { Button } from '@/components/ui/button';
import type { TipoEvaluacion } from '../../../types/evaluaciones';

interface Props {
  tiposEvaluacion: TipoEvaluacion[];
  loading: boolean;
  onView: (tipo: TipoEvaluacion) => void;
  onEdit: (tipo: TipoEvaluacion) => void;
  onDelete: (tipo: TipoEvaluacion) => void;
}

export function TiposEvaluacionTable({ tiposEvaluacion, loading, onView, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
        <p className="text-gray-500 mt-2">Cargando tipos de evaluación...</p>
      </div>
    );
  }

  if (!tiposEvaluacion || tiposEvaluacion.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No se encontraron tipos de evaluación</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requiere imagen</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tiposEvaluacion.map((tipo) => (
            <tr key={tipo.id_tipo} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tipo.codigo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tipo.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tipo.requiere_imagen ? 'Sí' : 'No'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tipo.activo ? 'Sí' : 'No'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onView(tipo)}>Ver</Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(tipo)}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(tipo)}>Eliminar</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

