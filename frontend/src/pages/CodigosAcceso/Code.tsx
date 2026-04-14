import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
import TablaCodigo from './ComponentsCodigo/TablaCodigo';
import PaginacionCodigo from './ComponentsCodigo/PaginacionCodigo';
import EditCodigoModal from './ComponentsCodigo/EditCodigoModal';
import ViewCodigo from './ComponentsCodigo/ViewCodigo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from 'react';
import type { CodigoAcceso } from '@/types/codigosAcceso';
import { codigosAccesoService } from '@/services/codigosAccesoService';

function CodigosAcceso() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const navigate = useNavigate();
  
  const [codigosAcceso, setCodigosAcceso] = useState<CodigoAcceso[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCodigo, setSelectedCodigo] = useState<CodigoAcceso | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCodigos = async (page = currentPage, limit = itemsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      const res = await codigosAccesoService.getAll({ page, limit });
      if (res.success) {
        setCodigosAcceso(res.data || []);
        setTotal(res.metadata?.total || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      } else {
        setError(res.message || 'Fallo API Códigos');
      }
    } catch (e: any) {
      setError(e?.message || 'Error conexión JSON');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodigos(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const metadata = { total_pages: totalPages, total: total };
  
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  // Obtener datos del usuario logueado para el DashboardLayout
  const currentUser = authService.getUserFromStorage();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const handleDelete = async (codigo: CodigoAcceso) => {
    try {
      const res = await codigosAccesoService.delete(codigo.id_codigo);
      if (res.success) {
        toast.success("Código revocado y eliminado permanentemente");
        fetchCodigos(); // Recargar datos de la tabla
      } else {
        toast.error(res.message || "No se pudo revocar el código");
      }
    } catch (e: any) {
      toast.error(e?.message || "Error al conectar con el servidor para revocar código");
    }
  };

  return (
    <DashboardLayout 
      user={sidebarUser}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header extraído con la misma estructura visual de Pacientes */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="mb-2">
              <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-3">
                Códigos de acceso
              </h1>
              <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
                Gestiona los códigos temporales generados para las pruebas cognitivas.
              </p>
            </div>
          </div>
          
          
        </div>

        <TablaCodigo
          codigos={codigosAcceso}
          loading={loading}
          error={error}
          searchTerm=""
          onSearch={() => {}}
          onView={(codigo) => {
            setSelectedCodigo(codigo);
            setIsViewModalOpen(true);
          }}
          onEdit={(codigo) => {
            setSelectedCodigo(codigo);
            setIsEditModalOpen(true);
          }}
          onDelete={handleDelete}
          onAdministerTest={(codigo) => {
            // Buscamos cualquier rastro de la palabra 'fluidez' o 'voz' en las propiedades de este objeto (independientemente de cómo el backend las nombre)
            const objStr = JSON.stringify(codigo).toLowerCase();
            const isVoiceTest = objStr.includes('fluidez') || objStr.includes('voz');
            
            if (isVoiceTest) {
              navigate(`/evaluaciones/voz/${codigo.id_codigo}`);
            } else {
              navigate(`/evaluaciones/cdt/${codigo.id_codigo}`);
            }
          }}
        />

        {isViewModalOpen && selectedCodigo && (
          <ViewCodigo
            open={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            codigo={selectedCodigo}
          />
        )}

        {isEditModalOpen && selectedCodigo && (
          <EditCodigoModal 
            open={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            codigo={selectedCodigo}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchCodigos();
            }} 
          />
        )}
        
        {/* Paginación a la izquierda y texto centrado */}
        <div className="mt-2 flex w-full items-center justify-between gap-2">
          {/* Izquierda: paginación */}
          <div className="flex items-center">
            <PaginacionCodigo
              currentPage={currentPage}
              totalPages={(metadata as any)?.total_pages ?? (metadata as any)?.totalPages ?? 1}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Centro: texto */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, (metadata as any)?.total ?? (metadata as any)?.totalItems ?? codigosAcceso.length)} de {(metadata as any)?.total ?? (metadata as any)?.totalItems ?? codigosAcceso.length} registros
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

      </div>
    </DashboardLayout>
  );
}

export default CodigosAcceso;
