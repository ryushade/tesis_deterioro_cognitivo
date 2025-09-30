import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

import { AppSidebar } from '../../components/app-sidebar';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { authService } from '../../services/auth';

import type { PruebaCognitiva } from '../../types/evaluaciones';
import pruebasCognitivasService from '../../services/pruebasCognitivas.service';

import PaginacionEvaluacion from './ComponentsEvaluaciones/PaginacionEvaluacion';
import { PruebasCognitivasTable } from './ComponentsEvaluaciones/PruebasCognitivasTable';
import { AddPrueba } from './ComponentsEvaluaciones/AddPrueba';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

function Evaluaciones() {
  // Estado UI
  const [showAddModal, setShowAddModal] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Datos
  const [pruebas, setPruebas] = useState<PruebaCognitiva[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usuario para sidebar
  const currentUser = authService.getUserFromStorage();
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido',
  };

  // Fetch
  const fetchPruebas = async (page = currentPage, limit = itemsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      const res = await pruebasCognitivasService.getAll({ page, limit });
      if (res.success) {
        setPruebas(res.data || []);
        setTotal(res.metadata?.total || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      } else {
        setError(res.message || 'Error al obtener pruebas cognitivas');
      }
    } catch (e: any) {
      setError(e?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPruebas(currentPage, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  // Handlers
  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const handleAddPrueba = () => {
    setShowAddModal(true);
  };

  const handleCreatePrueba = async (payload: any) => {
    const res = await pruebasCognitivasService.create(payload);
    if (!res.success) {
      throw new Error(res.message || 'Error al crear prueba');
    }
    toast.success('Prueba creada');
    setShowAddModal(false);
    setCurrentPage(1);
    await fetchPruebas(1, itemsPerPage);
  };

  const handleViewPrueba = (prueba: PruebaCognitiva) => {
    toast.success(`Ver prueba ${prueba.codigo}`);
  };

  const handleEditPrueba = (prueba: PruebaCognitiva) => {
    toast.success(`Editar prueba ${prueba.codigo}`);
  };

  const handleDeletePrueba = async (prueba: PruebaCognitiva) => {
    try {
      const res = await pruebasCognitivasService.delete(prueba.id_prueba);
      if (res.success) {
        toast.success('Prueba desactivada');
        fetchPruebas(currentPage, itemsPerPage);
      } else {
        toast.error(res.message || 'No se pudo eliminar');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Error eliminando prueba');
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const startIndex = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, total);

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar user={sidebarUser} onLogout={handleLogout} />
        <SidebarInset>
          <div className="flex-1 p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium">Error al cargar pruebas cognitivas</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <Button onClick={() => fetchPruebas(1, itemsPerPage)} className="mt-2">
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
                    Gestión de pruebas cognitivas
                  </h1>
                  <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
                    Gestiona las pruebas cognitivas disponibles.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleAddPrueba}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                <Plus className="h-4 w-4" />
                Agregar prueba
              </Button>
            </div>

            {/* Tabla de Pruebas */}
            <PruebasCognitivasTable
              pruebas={pruebas}
              loading={loading}
              onView={handleViewPrueba}
              onEdit={handleEditPrueba}
              onDelete={handleDeletePrueba}
            />

            {/* Paginación + resumen + selector */}
            <div className="mt-2 flex w-full items-center justify-between gap-3">
              <div className="flex items-center">
                <PaginacionEvaluacion
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>

              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-600">
                  Mostrando {total === 0 ? 0 : startIndex} a {endIndex} de {total} registros
                </p>
              </div>

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
                    <SelectItem value="1000000000">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Modal: Crear nueva prueba cognitiva */}
            {showAddModal && (
              <AddPrueba
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreate={handleCreatePrueba}
              />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Evaluaciones;

