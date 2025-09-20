import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
import { useGetPacientes } from '@/services/pacientesService';
import TablaPacientesSimple from '../components/TablaPacientesSimple';
import AddPacienteModal from '../components/AddPatient';
import EditPacienteModal from '../components/EditPaciente';
import ViewPacienteModal from '../components/ViewPaciente';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { pacientesService, type Paciente } from '@/services/pacientesService';
import toast, { Toaster } from 'react-hot-toast';

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
  const [itemsPerPage] = useState(10);
  
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
        if (response.success) {
          toast.success('Paciente eliminado exitosamente');
          refetch(currentPage, itemsPerPage, searchTerm);
        } else {
          toast.error(response.message || 'Error al eliminar paciente');
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
          totalPages={metadata.total_pages}
          onPageChange={handlePageChange}
          onView={handleViewPaciente}
          onEdit={handleEditPaciente}
          onDelete={handleDeletePaciente}
        />

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

        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Eliminar Paciente"
          message={`¿Eliminar a ${selectedPaciente?.nombres} ${selectedPaciente?.apellidos}?`}
          confirmText="Eliminar"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
}

export default Pacientes;
