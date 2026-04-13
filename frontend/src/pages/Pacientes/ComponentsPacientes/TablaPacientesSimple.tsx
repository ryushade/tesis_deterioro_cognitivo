import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Edit, 
  Trash2, 
  User,
  ClipboardList 
} from 'lucide-react';
import { type Paciente } from '@/services/pacienteServices';

interface TablaPacientesSimpleProps {
  pacientes: Paciente[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearch: (term: string) => void;
  onAsignarPrueba: (paciente: Paciente) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (paciente: Paciente) => void;
  onEdit: (paciente: Paciente) => void;
  onDelete: (paciente: Paciente) => void;
}

export default function TablaPacientesSimple({
  pacientes,
  loading,
  error,
  searchTerm,
  onSearch: _onSearch,
  onView,
  onEdit,
  onDelete,
  onAsignarPrueba
  
}: TablaPacientesSimpleProps) {
  const [pacienteToDelete, setPacienteToDelete] = useState<Paciente | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };
  
  const calculateEdad = (fecha_nacimiento: string | null) => {
    if (!fecha_nacimiento) return '-';
    const today = new Date();
    const birthDate = new Date(fecha_nacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando pacientes...</p>
      </div>
    );
  }

  

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-red-600 mb-4">
          <User className="h-12 w-12 mx-auto mb-2" />
          <p className="font-medium">Error al cargar pacientes</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header con búsqueda */}
     

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Nacimiento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sexo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Escolaridad
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
            {pacientes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No se encontraron pacientes</p>
                  {searchTerm && (
                    <p className="text-sm">
                      Intenta con otros términos de búsqueda
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              pacientes.map((paciente) => (
                <tr key={paciente.id_paciente} className="hover:bg-gray-50">
                
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {paciente.nombres} {paciente.apellidos}
                        </div>
                      
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      {formatDate(paciente.fecha_nacimiento)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-900\">
                      {paciente.edad ?? calculateEdad(paciente.fecha_nacimiento)} años
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      paciente.sexo === 0
                        ? 'text-blue-700 bg-blue-100'
                        : paciente.sexo === 1
                        ? 'text-purple-700 bg-purple-100'
                        : 'text-gray-700 bg-gray-100'
                    }`}>
                      {paciente.sexo === 0 ? 'Masculino' : 'Femenino'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      {paciente.escolaridad || 'No especificado'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${paciente.estado ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}`}>
                      {paciente.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAsignarPrueba(paciente)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <ClipboardList className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(paciente)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(paciente)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log("✅ Click en botón de basura. Paciente seleccionado:", paciente);
                          setPacienteToDelete(paciente);
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

      {/* La paginación se maneja en la página padre (PacientesSimple) */}

      {pacienteToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-2">
          <div className="bg-white fixed left-[50%] top-[50%] z-[101] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-xl">
            <div className="flex flex-col space-y-1 text-center items-center mt-2">
              
              {/* Media Icon - Exactamente como el diseño pedido */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100/80 text-red-600 mb-2">
                <Trash2 className="h-6 w-6" />
              </div>
              
              {/* Titles */}
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                ¿Eliminar paciente?
              </h2>
              <p className="text-[15px] pt-1 text-gray-600">
                Esto borrará permanentemente de la clínica el registro de{" "}
                <span className="font-semibold text-gray-900">
                  {pacienteToDelete.nombres} {pacienteToDelete.apellidos}
                </span>{" "}
                y toda su información.
              </p>
            </div>
            
            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setPacienteToDelete(null)}
                className="mt-2 sm:mt-0"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDelete(pacienteToDelete);
                  setPacienteToDelete(null);
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
