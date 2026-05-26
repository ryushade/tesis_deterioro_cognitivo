import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
import { useGetPacientes } from '@/services/pacienteServices';
import TablaPacientesSimple from './ComponentsPacientes/TablaPacientesSimple';
import AddPacienteModal from './ComponentsPacientes/AddPaciente';
import EditPacienteModal from './ComponentsPacientes/EditPaciente';
import AsignarPruebaDialog from './ComponentsPacientes/AsignarPrueba';  
import ViewPacienteModal from './ComponentsPacientes/ViewPaciente';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { pacientesService, type Paciente } from '@/services/pacienteServices';
import toast, { Toaster } from 'react-hot-toast';
import PaginacionPacientes from './ComponentsPacientes/PaginacionPacientes';
import BarraSearch from './ComponentsPacientes/BarraSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFilters {
  estadoCognitivo: string;
  edadMin: number;
  edadMax: number;
  estadoPaciente: string;
}

function Pacientes() {
  // Estados para los modales
  const [showAsignarPruebaModal, setShowAsignarPruebaModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  
  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filters, setFilters] = useState<SearchFilters>({
    estadoCognitivo: '',
    edadMin: 65,
    edadMax: 100,
    estadoPaciente: ''
  });
  
  // Hook para obtener pacientes
  const { pacientes, metadata, loading, error, refetch } = useGetPacientes(1, 5, '');

  const calculateEdad = (fecha_nacimiento: string | null) => {
    if (!fecha_nacimiento) return 0;
    const today = new Date();
    const birthDate = new Date(fecha_nacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // 1. Filtramos los pacientes recibidos
  const filteredPacientes = pacientes.filter((paciente) => {
    if (filters.estadoPaciente !== '') {
      const activeFilterNum = parseInt(filters.estadoPaciente);
      if (paciente.estado !== activeFilterNum) return false;
    }
    const edad = paciente.edad ?? calculateEdad(paciente.fecha_nacimiento);
    if (edad < filters.edadMin || edad > filters.edadMax) return false;
    if (filters.estadoCognitivo !== '') {
      const pacAny = paciente as any;
      if (pacAny.estado_cognitivo && pacAny.estado_cognitivo !== filters.estadoCognitivo) return false;
    }
    return true;
  });

  // 2. Cortamos el array para que solo se muestren 5 registros por defecto
  const paginatedPacientes = filteredPacientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleAsignarPrueba = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setShowAsignarPruebaModal(true);
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
        if (response?.success) {
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

        {/* Barra de búsqueda y filtros */}
        <BarraSearch
          onSearch={handleSearch}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1); // Regresamos a la pag 1 cuando cambia el filtro
          }}
          className="mb-4"
        />

        {/* Tabla de pacientes */}
        <TablaPacientesSimple
          pacientes={paginatedPacientes} 
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          currentPage={currentPage}
          totalPages={(metadata as any)?.total_pages ?? (metadata as any)?.totalPages ?? (Math.ceil(filteredPacientes.length / itemsPerPage) || 1)}
          onPageChange={handlePageChange}
          onAsignarPrueba={handleAsignarPrueba}
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
              totalPages={(metadata as any)?.total_pages ?? (metadata as any)?.totalPages ?? (Math.ceil(filteredPacientes.length / itemsPerPage) || 1)}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Centro: texto */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-600">
              Mostrando {filteredPacientes.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, (metadata as any)?.total ?? (metadata as any)?.totalItems ?? filteredPacientes.length)} de {(metadata as any)?.total ?? (metadata as any)?.totalItems ?? filteredPacientes.length} registros
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
        {showAsignarPruebaModal && selectedPaciente && (
          <AsignarPruebaDialog
            open={showAsignarPruebaModal}
            onClose={() => setShowAsignarPruebaModal(false)}
            paciente={selectedPaciente}
            onSuccess={() => {
              setShowAsignarPruebaModal(false);
              handleRefresh();
            }}
          />
        )}

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