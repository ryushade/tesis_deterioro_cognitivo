import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { CodigoAcceso } from '@/types/codigosAcceso';

interface Props {
  codigos: CodigoAcceso[];
  onView: (codigo: CodigoAcceso) => void;
  onEdit: (codigo: CodigoAcceso) => void;
  onDelete: (codigo: CodigoAcceso) => void;
}

export default function TablaCodigo({ codigos, onView, onEdit, onDelete }: Props) {
  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) return 'Nunca';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return String(fecha);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'emitido': return 'text-blue-600 bg-blue-100';
      case 'usado': return 'text-green-600 bg-green-100';
      case 'vencido': return 'text-red-600 bg-red-100';
      case 'revocado': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paciente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo Evaluación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Vencimiento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Creación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Último Uso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {codigos.map((codigo) => (
            <tr key={codigo.id_codigo} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono text-sm font-medium text-gray-900">
                  {codigo.codigo}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {codigo.id_paciente}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {codigo.tipo_evaluacion}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(codigo.estado)}`}>
                  {codigo.estado}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatFecha(codigo.vence_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatFecha(codigo.creado_en)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {codigo.ultimo_uso_en ? formatFecha(codigo.ultimo_uso_en) : 'Nunca'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex gap-1">
                  <Button
                    onClick={() => onView(codigo)}
                    className="text-blue-600 bg-transparent border-none p-2 rounded hover:bg-blue-50"
                    title="Ver código"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onEdit(codigo)}
                    className="text-gray-600 bg-transparent border-none p-2 rounded hover:bg-gray-50"
                    title="Editar código"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onDelete(codigo)}
                    className="text-red-600 bg-transparent border-none p-2 rounded hover:bg-red-50"
                    title="Eliminar código"
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
  );
}
