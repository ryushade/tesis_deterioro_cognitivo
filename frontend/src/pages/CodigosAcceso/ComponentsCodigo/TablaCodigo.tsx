import { Eye, Edit, Trash2, ClipboardList } from 'lucide-react';
import type { CodigoAcceso } from '@/types/codigosAcceso';
import { getTipoEvaluacionDescription } from '@/types/codigosAcceso';

interface Props {
  codigos: CodigoAcceso[];
  onView: (codigo: CodigoAcceso) => void;
  onEdit: (codigo: CodigoAcceso) => void;
  onDelete: (codigo: CodigoAcceso) => void;
  onAdministerTest?: (codigo: CodigoAcceso) => void;
}

export default function TablaCodigo({ codigos, onView, onEdit, onDelete, onAdministerTest }: Props) {
  const getNombrePaciente = (c: CodigoAcceso) => {
    const nombre = (c.nombre_paciente || '').trim();
    if (nombre) return nombre;
    const compuesto = [c.nombres, c.apellidos].filter(Boolean).join(' ').trim();
    return compuesto || `ID ${c.id_paciente}`;
  };
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
              PRUEBA COGNITIVA
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Vencimiento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha creación
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
                {getNombrePaciente(codigo)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getTipoEvaluacionDescription(codigo.tipo_evaluacion as any)}
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
                    <div className="flex items-center gap-4">
                      {/* Administrar test MMSE - solo para códigos tipo MMSE en estado emitido */}
                      {onAdministerTest && 
                       codigo.tipo_evaluacion?.toUpperCase() === 'MMSE' && 
                       codigo.estado === 'emitido' && (
                        <ClipboardList
                          className="h-4 w-4 cursor-pointer text-green-600 hover:text-green-700"
                          title="Administrar MMSE"
                          onClick={() => onAdministerTest(codigo)}
                        />
                      )}
                      <Eye
                        className="h-4 w-4 cursor-pointer text-blue-600 hover:text-blue-700"
                        title="Ver"
                        onClick={() => onView(codigo)}
                      />
                      <Edit
                        className="h-4 w-4 cursor-pointer text-amber-600 hover:text-amber-700"
                        title="Editar"
                        onClick={() => onEdit(codigo)}
                      />
                      <Trash2
                        className="h-4 w-4 cursor-pointer text-red-600 hover:text-red-700"
                        title="Eliminar"
                        onClick={() => onDelete(codigo)}
                      />
                    </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
