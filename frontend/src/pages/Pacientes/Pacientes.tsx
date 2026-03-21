import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
// import { useGetPacientes } from '@/services/pacientes.services';
const useGetPacientes = () => ({ pacientes: [], metadata: {}, loading: false, error: null, refetch: (a?:any,b?:any,c?:any) => {} });
import TablaPacientesSimple from './ComponentsPacientes/TablaPacientesSimple';
import AddPacienteModal from './ComponentsPacientes/AddPaciente';
import EditPacienteModal from './ComponentsPacientes/EditPaciente';
import ViewPacienteModal from './ComponentsPacientes/ViewPaciente';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
// import { pacientesService, type Paciente } from '@/services/pacientes.services';
type Paciente = any;
const pacientesService = { delete: async (id: any) => false };
import toast, { Toaster } from 'react-hot-toast';
import PaginacionPacientes from './ComponentsPacientes/PaginacionPacientes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function Pacientes() {
  // Estados para los modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  
  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Hook para obtener pacientes
  const { pacientes, metadata, loading, error, refetch } = useGetPacientes();

  // Get user data from localStorage
  const currentUser = authService.getUserFromStorage();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  // Handlers para modales
  const handleAddPaciente = () => {
    setShowAddModal(true);
  };

  const handleViewPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setShowViewModal(true);
  };

  const handleEditPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setShowEditModal(true);
  };

  const handleDeletePaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedPaciente) {
      try {
        const response = await pacientesService.delete(selectedPaciente.id_paciente);
        if (response) {
          toast.success('Paciente eliminado exitosamente');
          refetch(currentPage, itemsPerPage, searchTerm);
        } else {
          toast.error('Error al eliminar paciente');
        }
      } catch (error) {
        console.error('Error deleting paciente:', error);
        toast.error('Error de conexión al servidor');
      }
    }
    setShowDeleteDialog(false);
    setSelectedPaciente(null);
  };

  // Handler para refrescar datos después de operaciones CRUD
  const handleRefresh = () => {
    refetch(currentPage, itemsPerPage, searchTerm);
  };

  // Handler para búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    refetch(1, itemsPerPage, term);
  };

  // Handler para cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch(page, itemsPerPage, searchTerm);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    refetch(1, size, searchTerm);
  };

  return (
    <DashboardLayout 
      user={sidebarUser}
      onLogout={handleLogout}
    >
      <Toaster position="top-right" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
           <div className="mb-2">
        <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-3">
          Gestión de pacientes
        </h1>
        <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
          Administra y visualiza la información de todos los pacientes registrados en el sistema.
        </p>
      </div>
          </div>
          
          <Button
            onClick={handleAddPaciente}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Agregar paciente
          </Button>
        </div>

        

        {/* Tabla de pacientes */}
        <TablaPacientesSimple
          pacientes={pacientes}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          currentPage={currentPage}
          totalPages={(metadata as any)?.total_pages ?? (metadata as any)?.totalPages ?? 1}
          onPageChange={handlePageChange}
          onView={handleViewPaciente}
          onEdit={handleEditPaciente}
          onDelete={handleDeletePaciente}
        />

       

        {/* Paginación a la izquierda y texto centrado */}
        <div className="mt-2 flex w-full items-center justify-between gap-2">
          {/* Izquierda: paginación */}
          <div className="flex items-center">
            <PaginacionPacientes
              currentPage={currentPage}
              totalPages={(metadata as any)?.total_pages ?? (metadata as any)?.totalPages ?? 1}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Centro: texto */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, (metadata as any)?.total ?? (metadata as any)?.totalItems ?? pacientes.length)} de {(metadata as any)?.total ?? (metadata as any)?.totalItems ?? pacientes.length} registros
            </p>
          </div>
            
          
          {/* Derecha: espacio para balancear */}
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span className="whitespace-nowrap">Filas por página:</span>
            <Select value={String(itemsPerPage)} onValueChange={(value) => handlePageSizeChange(Number(value))}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Entradas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100000000000">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Modales */}
        <AddPacienteModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            handleRefresh();
          }}
        />

        {showEditModal && selectedPaciente && (
          <EditPacienteModal
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            paciente={selectedPaciente}
            onSuccess={() => {
              setShowEditModal(false);
              handleRefresh();
            }}
          />
        )}

        {showViewModal && selectedPaciente && (
          <ViewPacienteModal
            open={showViewModal}
            onClose={() => setShowViewModal(false)}
            paciente={selectedPaciente}
          />
        )}

        <ConfirmationModal
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Eliminar Paciente"
          message={`¿Eliminar a ${selectedPaciente?.nombres} ${selectedPaciente?.apellidos}?`}
          confirmText="Eliminar"
          type="danger"
        />
      </div>
    </DashboardLayout>
  );
}

export default Pacientes;
