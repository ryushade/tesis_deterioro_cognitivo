import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Code,
  FileCode2
} from 'lucide-react';
import type { CodigoAcceso } from '@/types/codigosAcceso';
import { getEstadoColor, getEstadoLabel, getTipoEvaluacionLabel } from '@/types/codigosAcceso';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface TablaCodigoProps {
  codigos: CodigoAcceso[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearch: (term: string) => void;
  onView: (codigo: CodigoAcceso) => void;
  onEdit: (codigo: CodigoAcceso) => void;
  onDelete: (codigo: CodigoAcceso) => void;
  onAdministerTest: (codigo: CodigoAcceso) => void;
}

export default function TablaCodigo({
  codigos,
  loading,
  error,
  searchTerm,
  onSearch: _onSearch,
  onView,
  onEdit,
  onDelete,
  onAdministerTest
}: TablaCodigoProps) {
  const [codigoToDelete, setCodigoToDelete] = useState<CodigoAcceso | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando códigos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-red-600 mb-4">
          <Code className="h-12 w-12 mx-auto mb-2" />
          <p className="font-medium">Error al cargar códigos</p>
          <p className="text-sm">{error}</p>
        </div>
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
                Código
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prueba
              </th>
               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CREACIÓN
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
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
            {codigos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <Code className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No se encontraron códigos de acceso</p>
                  {searchTerm && (
                    <p className="text-sm mt-1 text-gray-400">
                      Intenta con otros términos de búsqueda
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              codigos.map((codigo) => (
                <tr key={codigo.id_codigo} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono font-bold tracking-widest text-blue-600">
                      {codigo.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {codigo.nombre_paciente}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {getTipoEvaluacionLabel(codigo.tipo_evaluacion)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(codigo.creado_en)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(codigo.vence_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {/* Generador condicional de Badges usando directamente el helper de tus Types */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(codigo.estado)}`}>
                      {getEstadoLabel(codigo.estado)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      {/* Botón Personalizado para Código (Evaluar paciente con ese código) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdministerTest(codigo)}
                        className="text-green-600 hover:text-green-800"
                        title="Administrar prueba al paciente"
                      >
                        <FileCode2 className="h-4 w-4" />
                      </Button>

                      {/* Botones CRUD Normales idénticos a Pacientes */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(codigo)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver código"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(codigo)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Editar estado"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCodigoToDelete(codigo)}
                        className="text-red-600 hover:text-red-800"
                        title="Revocar código"
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

      <ConfirmationModal
        isOpen={!!codigoToDelete}
        onClose={() => setCodigoToDelete(null)}
        onConfirm={() => {
          if (codigoToDelete) {
            onDelete(codigoToDelete);
            setCodigoToDelete(null);
          }
        }}
        title="¿Revocar código de acceso?"
        message={`Esta acción invalidará permanentemente el código de evaluación temporal "${codigoToDelete?.codigo}" perteneciente a ${codigoToDelete?.nombre_paciente}.`}
        type="danger"
        confirmText="Revocar"
        cancelText="Cancelar"
      />
    </div>
  );
}
