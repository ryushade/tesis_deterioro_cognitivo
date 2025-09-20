import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { AppSidebar } from '../../components/app-sidebar';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { authService } from '../../services/auth';
import type { CodigoAcceso } from '../../types/codigosAcceso';
import { Eye, Edit, Trash2 } from 'lucide-react';
import AddCodigoModal from './ComponentsCodigo/AddCodigo';
import EditCodigoModal from './ComponentsCodigo/EditCodigo';
import ViewCodigoModal from './ComponentsCodigo/ViewCodigo';
import './CodigosAcceso.css';

// Mock data for testing
const mockCodigosAcceso: CodigoAcceso[] = [
  {
    id_codigo: 1,
    codigo: 'CDT001',
    id_paciente: 101,
    nombre_paciente: 'Juan Pérez',
    nombres: 'Juan',
    apellidos: 'Pérez',
    tipo_evaluacion: 'CDT',
    vence_at: '2025-12-31',
    estado: 'emitido',
    creado_en: '2024-01-15',
    ultimo_uso_en: undefined,
    esta_vencido: false,
    horas_restantes: 2400
  },
  {
    id_codigo: 2,
    codigo: 'MMSE002',
    id_paciente: 102,
    nombre_paciente: 'María García',
    nombres: 'María',
    apellidos: 'García',
    tipo_evaluacion: 'MMSE',
    vence_at: '2025-06-30',
    estado: 'usado',
    creado_en: '2024-02-20',
    ultimo_uso_en: '2024-03-15',
    esta_vencido: false,
    horas_restantes: 1200
  }
];

function CodigosAcceso() {
  // Estados para los modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState<CodigoAcceso | null>(null);
  
  // Mock data
  const codigosAcceso = mockCodigosAcceso;
  const loading = false;
  const error = null;

  // Get user data from localStorage
  const currentUser = authService.getUserFromStorage();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleAddCodigo = () => {
    setShowAddModal(true);
  }

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const handleViewCodigo = (codigo: CodigoAcceso) => {
    setSelectedCodigo(codigo);
    setShowViewModal(true);
  };

  const handleEditCodigo = (codigo: CodigoAcceso) => {
    setSelectedCodigo(codigo);
    setShowEditModal(true);
  };

  const handleDeleteCodigo = (codigo: CodigoAcceso) => {
    setSelectedCodigo(codigo);
    setShowDeleteDialog(true);
  };

  // Handler para refrescar datos después de operaciones CRUD
  const handleRefresh = () => {
    toast.success('Datos actualizados');
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar user={sidebarUser} onLogout={handleLogout} />
        <SidebarInset>
          <div className="flex-1 p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium">Error al cargar códigos de acceso</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <Button onClick={handleRefresh} className="mt-2">
                Reintentar
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} onLogout={handleLogout} />
      <SidebarInset>
        <div className="flex-1 p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="mb-2">
                  <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-3">
                    Gestión de códigos de acceso
                  </h1>
                  <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
                    Gestiona los códigos de acceso para las evaluaciones del deterioro cognitivo.
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleAddCodigo}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                <Plus className="h-4 w-4" />
                Agregar código
              </Button>
            </div>
          

          

          

          {/* Tabla de Códigos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando códigos...</p>
              </div>
            ) : codigosAcceso.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No se encontraron códigos de acceso</p>
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
                    {codigosAcceso.map((codigo) => (
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
                              onClick={() => handleViewCodigo(codigo)}
                              className="text-blue-600 bg-transparent border-none p-2 rounded hover:bg-blue-50"
                              title="Ver código"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleEditCodigo(codigo)}
                              className="text-gray-600 bg-transparent border-none p-2 rounded hover:bg-gray-50"
                              title="Editar código"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                           
                            <Button
                              onClick={() => handleDeleteCodigo(codigo)}
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
            )}
          </div>

          {/* Diálogos simplificados */}
          {showDeleteDialog && selectedCodigo && (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
                WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
              }}
            >
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que deseas eliminar el código <strong>{selectedCodigo.codigo}</strong>?
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowDeleteDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success(`Código ${selectedCodigo.codigo} eliminado`);
                      setShowDeleteDialog(false);
                      setSelectedCodigo(null);
                      handleRefresh();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Modales */}
          <AddCodigoModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              handleRefresh();
            }}
          />

          {showEditModal && selectedCodigo && (
            <EditCodigoModal
              open={showEditModal}
              onClose={() => setShowEditModal(false)}
              codigo={selectedCodigo}
              onSuccess={() => {
                setShowEditModal(false);
                handleRefresh();
              }}
            />
          )}

          {showViewModal && selectedCodigo && (
            <ViewCodigoModal
              open={showViewModal}
              onClose={() => setShowViewModal(false)}
              codigo={selectedCodigo}
            />
          )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default CodigosAcceso;
