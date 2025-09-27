import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { AppSidebar } from '../../components/app-sidebar';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { authService } from '../../services/auth';
import type { CodigoAcceso } from '../../types/codigosAcceso';
import { Eye, Edit, Trash2 } from 'lucide-react';
import PaginacionCodigo from './ComponentsCodigo/PaginacionCodigo';
import TablaCodigo from './ComponentsCodigo/TablaCodigo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
    nombre_paciente: 'Juan PÃ©rez',
    nombres: 'Juan',
    apellidos: 'PÃ©rez',
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
    nombre_paciente: 'MarÃ­a GarcÃ­a',
    nombres: 'MarÃ­a',
    apellidos: 'GarcÃ­a',
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
  // PaginaciÃ³n
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const total = codigosAcceso.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, total);
  const pageCodigos = codigosAcceso.slice(startIndex, endIndex);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  // Handler para refrescar datos despuÃ©s de operaciones CRUD
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
              <h3 className="text-red-800 font-medium">Error al cargar cÃ³digos de acceso</h3>
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
        <div className="flex-1 p-4">
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
          

          

          

          {/* Tabla de CÃ³digos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando cÃ³digos...</p>
              </div>
            ) : codigosAcceso.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No se encontraron cÃ³digos de acceso</p>
              </div>
            ) : (
              <TablaCodigo
                codigos={pageCodigos}
                onView={handleViewCodigo}
                onEdit={handleEditCodigo}
                onDelete={handleDeleteCodigo}
              />
            )}

            {/* Paginacion a la izquierda, resumen centrado y selector a la derecha */}
           
          </div>
           <div className="mt-4 flex w-full items-center justify-between gap-3">
              {/* Izquierda: paginacion */}
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
                <Select value={String(itemsPerPage)} onValueChange={(v) => handlePageSizeChange(Number(v))}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Entradas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          {/* DiÃ¡logos simplificados */}
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
                <h3 className="text-lg font-semibold mb-4">Confirmar EliminaciÃ³n</h3>
                <p className="text-gray-600 mb-6">
                  Â¿EstÃ¡s seguro de que deseas eliminar el cÃ³digo <strong>{selectedCodigo.codigo}</strong>?
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
                      toast.success(`CÃ³digo ${selectedCodigo.codigo} eliminado`);
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


