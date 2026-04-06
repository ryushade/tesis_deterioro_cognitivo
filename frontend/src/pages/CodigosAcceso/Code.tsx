import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
import type { CodigoAcceso, CodigoAccesoListResponse } from '@/types/codigosAcceso';
import PaginacionCodigo from './ComponentsCodigo/PaginacionCodigo';
import TablaCodigo from './ComponentsCodigo/TablaCodigo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AddCodigoModal from './ComponentsCodigo/AddCodigo';
import EditCodigoModal from './ComponentsCodigo/EditCodigo';
import ViewCodigoModal from './ComponentsCodigo/ViewCodigo';
import MMSEAdmin from '../Evaluaciones/ComponentsEvaluaciones/Pruebas/MMSE/MMSEAdmin';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import toast, { Toaster } from 'react-hot-toast';

// import { codigosAccesoService } from '@/services/codigosAccesoService';
const codigosAccesoService = { getAll: async (a?:any) => ({ success: false, metadata: {total:0, total_pages: 1}, data: [], message: 'En mantenimiento'}) };

function CodigosAcceso() {
  // Estados para los modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMMSEAdminModal, setShowMMSEAdminModal] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState<CodigoAcceso | null>(null);
  
  // Datos desde backend
  const [codigosAcceso, setCodigosAcceso] = useState<CodigoAcceso[]>([]);
  
  // Búsqueda y Paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCodigos = async (page = currentPage, limit = itemsPerPage, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      // Incluí search temporal para uniformidad con paciente, asumiendo su API lo ignore si no lo usa
      const res: CodigoAccesoListResponse = await codigosAccesoService.getAll({ page, limit, search });
      if (res.success) {
        setCodigosAcceso(res.data || []);
        setTotal(res.metadata?.total || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      } else {
        setError(res.message || 'Error al obtener códigos de acceso');
      }
    } catch (e: any) {
      setError(e?.message || 'Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodigos(currentPage, itemsPerPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchTerm]);

  // Obtener datos del usuario logueado para Navbar
  const currentUser = authService.getUserFromStorage();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  // Handlers
  const handleAddCodigo = () => setShowAddModal(true);

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

  const handleAdministerTest = (codigo: CodigoAcceso) => {
    setSelectedCodigo(codigo);
    setShowMMSEAdminModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCodigo) {
      // Falta la llamada asíncrona pero mantenemos en mocking como lo tenías:
      toast.success(`Código ${selectedCodigo.codigo} eliminado de manera virtual`);
      handleRefresh();
    }
    setShowDeleteDialog(false);
    setSelectedCodigo(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    toast.success('Datos actualizados');
    fetchCodigos(currentPage, itemsPerPage, searchTerm);
  };

  // Cálculos para paginador string
  const startIndex = total === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = total === 0 ? 0 : Math.min(startIndex + codigosAcceso.length, total);

  if (error) {
    return (
      <DashboardLayout user={sidebarUser} onLogout={handleLogout}>
        <div className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium">Error al cargar códigos de acceso</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <Button onClick={handleRefresh} className="mt-2">
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      user={sidebarUser}
      onLogout={handleLogout}
    >
      <Toaster position="top-right" />
      
      <div className="space-y-6">
        {/* Header exacto al de Pacientes.tsx */}
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

        {/* Tabla insertada y alineada en márgenes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando códigos...</p>
            </div>
          ) : codigosAcceso.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No se encontraron códigos de acceso.</p>
            </div>
          ) : (
            <TablaCodigo
              codigos={codigosAcceso}
              onView={handleViewCodigo}
              onEdit={handleEditCodigo}
              onDelete={handleDeleteCodigo}
              onAdministerTest={handleAdministerTest}
            />
          )}
        </div>

        {/* Control de Paginación exacto al de Pacientes.tsx */}
        <div className="mt-2 flex w-full items-center justify-between gap-2">
          {/* Izquierda: paginación */}
          <div className="flex items-center">
            <PaginacionCodigo
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Centro: texto */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-600">
              Mostrando {total === 0 ? 0 : startIndex + 1} a {endIndex} de {total} registros
            </p>
          </div>
            
          {/* Derecha: selector de entradas */}
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

        {/* Modales modernizados */}
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

        {showMMSEAdminModal && selectedCodigo && (
          <MMSEAdmin
            codigo={selectedCodigo}
            onClose={() => {
              setShowMMSEAdminModal(false);
              setSelectedCodigo(null);
            }}
            onSuccess={() => {
              handleRefresh();
            }}
          />
        )}

        <ConfirmationModal
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Eliminar Código"
          message={`¿Estás seguro de que deseas eliminar el código ${selectedCodigo?.codigo}?`}
          confirmText="Eliminar Código"
          type="danger"
        />
      </div>
    </DashboardLayout>
  );
}

export default CodigosAcceso;
