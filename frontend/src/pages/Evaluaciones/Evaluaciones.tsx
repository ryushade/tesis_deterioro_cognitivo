import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { AppSidebar } from '../../components/app-sidebar';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { authService } from '../../services/auth';
import type { EvaluacionCognitiva, TipoEvaluacion } from '../../types/evaluaciones';
import { Eye, Edit, Trash2, Brain, Clock } from 'lucide-react';
import PaginacionEvaluacion from './ComponentsEvaluaciones/PaginacionEvaluacion';
import { TiposEvaluacionTab } from './ComponentsEvaluaciones/TiposEvaluacionTab';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

// Mock data for testing
const mockEvaluaciones: EvaluacionCognitiva[] = [
  {
    id_evaluacion: 1,
    id_paciente: 101,
    id_codigo: 1,
    id_tipo: 1,
    fecha_evaluacion: '2024-03-15T10:30:00Z',
    puntuacion_total: 24.5,
    puntuacion_maxima: 30.0,
    porcentaje_acierto: 81.67,
    clasificacion: 'Normal',
    confianza: 0.95,
    estado_procesamiento: 'completada',
    tiempo_procesamiento: 2.5,
    version_algoritmo: 'v2.1.0',
    observaciones: 'EvaluaciÃ³n completada sin incidencias',
    actualizado_en: '2024-03-15T10:35:00Z',
    paciente_nombre: 'Juan PÃ©rez',
    tipo_evaluacion_nombre: 'Clock Drawing Test',
    tipo_evaluacion_codigo: 'CDT',
    codigo_acceso: 'CDT001'
  },
  {
    id_evaluacion: 2,
    id_paciente: 102,
    id_codigo: 2,
    id_tipo: 2,
    fecha_evaluacion: '2024-03-20T14:15:00Z',
    puntuacion_total: 18.0,
    puntuacion_maxima: 30.0,
    porcentaje_acierto: 60.0,
    clasificacion: 'Deterioro Leve',
    confianza: 0.87,
    estado_procesamiento: 'completada',
    tiempo_procesamiento: 1.8,
    version_algoritmo: 'v1.5.2',
    observaciones: 'Se observan dificultades en memoria a corto plazo',
    actualizado_en: '2024-03-20T14:20:00Z',
    paciente_nombre: 'MarÃ­a GarcÃ­a',
    tipo_evaluacion_nombre: 'Mini Mental State Examination',
    tipo_evaluacion_codigo: 'MMSE',
    codigo_acceso: 'MMSE002'
  },
  {
    id_evaluacion: 3,
    id_paciente: 103,
    id_tipo: 1,
    fecha_evaluacion: '2024-03-22T09:45:00Z',
    puntuacion_total: 0,
    puntuacion_maxima: 30.0,
    porcentaje_acierto: 0,
    estado_procesamiento: 'procesando',
    actualizado_en: '2024-03-22T09:45:00Z',
    paciente_nombre: 'Carlos LÃ³pez',
    tipo_evaluacion_nombre: 'Clock Drawing Test',
    tipo_evaluacion_codigo: 'CDT'
  }
];

// Mock tipos de evaluación para poblar el tab
const mockTiposEvaluacion: TipoEvaluacion[] = [
  {
    id_tipo: 1,
    codigo: 'CDT',
    nombre: 'Clock Drawing Test',
    requiere_imagen: true,
    requiere_metodo: true,
    activo: true,
    creado_en: '2024-01-10',
  },
  {
    id_tipo: 2,
    codigo: 'MMSE',
    nombre: 'Mini Mental State Examination',
    requiere_imagen: false,
    requiere_metodo: false,
    activo: true,
    creado_en: '2024-02-05',
  },
  {
    id_tipo: 3,
    codigo: 'MoCA',
    nombre: 'Montreal Cognitive Assessment',
    requiere_imagen: false,
    requiere_metodo: false,
    activo: false,
    creado_en: '2024-03-01',
  },
];

function Evaluaciones() {
  // Estados para los modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<EvaluacionCognitiva | null>(null);
  // PaginaciÃ³n
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Mock data
  const evaluaciones = mockEvaluaciones;
  const total = evaluaciones.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, total);
  const pageEvaluaciones = evaluaciones.slice(startIndex, endIndex);
  const loading = false;
  const error = null;

  // Get user data from localStorage
  const currentUser = authService.getUserFromStorage();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleAddEvaluacion = () => {
    setShowAddModal(true);
  }

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const handleViewEvaluacion = (evaluacion: EvaluacionCognitiva) => {
    setSelectedEvaluacion(evaluacion);
    setShowViewModal(true);
  };

  const handleEditEvaluacion = (evaluacion: EvaluacionCognitiva) => {
    setSelectedEvaluacion(evaluacion);
    setShowEditModal(true);
  };

  const handleDeleteEvaluacion = (evaluacion: EvaluacionCognitiva) => {
    setSelectedEvaluacion(evaluacion);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'text-green-600 bg-green-100';
      case 'procesando': return 'text-yellow-600 bg-yellow-100';
      case 'pendiente': return 'text-blue-600 bg-blue-100';
      case 'fallida': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getClasificacionColor = (clasificacion: string) => {
    switch (clasificacion?.toLowerCase()) {
      case 'normal': return 'text-green-700 bg-green-100';
      case 'deterioro leve': return 'text-yellow-700 bg-yellow-100';
      case 'deterioro moderado': return 'text-orange-700 bg-orange-100';
      case 'deterioro severo': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar user={sidebarUser} onLogout={handleLogout} />
        <SidebarInset>
          <div className="flex-1 p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium">Error al cargar evaluaciones cognitivas</h3>
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
                    Gestión de evaluaciones cognitivas
                  </h1>
                  <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
                    Administra y visualiza los resultados de las evaluaciones cognitivas realizadas.
                  </p>
                  <div className="mt-4">
                    <TiposEvaluacionTab tiposEvaluacion={[]} loading={false} onView={() => {}} onEdit={() => {}} onDelete={() => {}} />
                  </div>
                  
                </div>
              </div>
              
              <Button
                onClick={handleAddEvaluacion}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                <Plus className="h-4 w-4" />
                Agregar evaluaciÃ³n
              </Button>
            </div>
          

          

          

          {/* Tabla de Evaluaciones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando evaluaciones...</p>
              </div>
            ) : evaluaciones.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No se encontraron evaluaciones cognitivas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                     
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo EvaluaciÃ³n
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PuntuaciÃ³n
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ClasificaciÃ³n
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pageEvaluaciones.map((evaluacion) => (
                      <tr key={evaluacion.id_evaluacion} className="hover:bg-gray-50">
                        
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{evaluacion.paciente_nombre}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{evaluacion.tipo_evaluacion_codigo}</div>
                            <div className="text-gray-500">{evaluacion.tipo_evaluacion_nombre}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFecha(evaluacion.fecha_evaluacion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {evaluacion.estado_procesamiento === 'completada' ? (
                            <div>
                              <div className="font-medium">
                                {evaluacion.puntuacion_total}/{evaluacion.puntuacion_maxima}
                              </div>
                              <div className="text-gray-500">
                                {evaluacion.porcentaje_acierto.toFixed(1)}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {evaluacion.clasificacion ? (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getClasificacionColor(evaluacion.clasificacion)}`}>
                              {evaluacion.clasificacion}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(evaluacion.estado_procesamiento)}`}>
                            {evaluacion.estado_procesamiento}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-1">
                            <Button
                              onClick={() => handleViewEvaluacion(evaluacion)}
                              className="text-blue-600 bg-transparent border-none p-2 rounded hover:bg-blue-50"
                              title="Ver evaluaciÃ³n"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleEditEvaluacion(evaluacion)}
                              className="text-gray-600 bg-transparent border-none p-2 rounded hover:bg-gray-50"
                              title="Editar evaluaciÃ³n"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteEvaluacion(evaluacion)}
                              className="text-red-600 bg-transparent border-none p-2 rounded hover:bg-red-50"
                              title="Eliminar evaluaciÃ³n"
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

          {/* PaginaciÃ³n a la izquierda, resumen centrado y selector a la derecha */}
          <div className="mt-4 flex w-full items-center justify-between gap-3">
            {/* Izquierda: paginaciÃ³n */}
            <div className="flex items-center">
              <PaginacionEvaluacion
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
              <span className="whitespace-nowrap">Filas por pÃ¡gina:</span>
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

          {/* DiÃ¡logos simplificados */}
          {showDeleteDialog && selectedEvaluacion && (
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
                  Â¿EstÃ¡s seguro de que deseas eliminar la evaluaciÃ³n <strong>#{selectedEvaluacion.id_evaluacion}</strong>?
                  <br />
                  <span className="text-sm text-gray-500 mt-2 block">
                    Paciente: {selectedEvaluacion.paciente_nombre}
                  </span>
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
                      toast.success(`EvaluaciÃ³n #${selectedEvaluacion.id_evaluacion} eliminada`);
                      setShowDeleteDialog(false);
                      setSelectedEvaluacion(null);
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

          {/* Modales - TODO: Crear componentes especÃ­ficos para evaluaciones */}
          {showAddModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                 style={{
                   backgroundColor: 'rgba(0, 0, 0, 0.5)',
                   backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
                   WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
                 }}>
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Nueva EvaluaciÃ³n</h3>
                <p className="text-gray-600 mb-6">
                  Modal para crear nueva evaluaciÃ³n cognitiva - En desarrollo
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}

          

          {showEditModal && selectedEvaluacion && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                 style={{
                   backgroundColor: 'rgba(0, 0, 0, 0.5)',
                   backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
                   WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
                 }}>
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Editar EvaluaciÃ³n #{selectedEvaluacion.id_evaluacion}</h3>
                <p className="text-gray-600 mb-6">
                  Modal para editar evaluaciÃ³n cognitiva - En desarrollo
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showViewModal && selectedEvaluacion && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                 style={{
                   backgroundColor: 'rgba(0, 0, 0, 0.5)',
                   backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
                   WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
                 }}>
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Detalles EvaluaciÃ³n #{selectedEvaluacion.id_evaluacion}</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Paciente:</strong> {selectedEvaluacion.paciente_nombre}</div>
                  <div><strong>Tipo:</strong> {selectedEvaluacion.tipo_evaluacion_nombre}</div>
                  <div><strong>Fecha:</strong> {formatFecha(selectedEvaluacion.fecha_evaluacion)}</div>
                  <div><strong>Estado:</strong> {selectedEvaluacion.estado_procesamiento}</div>
                  {selectedEvaluacion.clasificacion && (
                    <div><strong>ClasificaciÃ³n:</strong> {selectedEvaluacion.clasificacion}</div>
                  )}
                  {selectedEvaluacion.puntuacion_total > 0 && (
                    <div><strong>PuntuaciÃ³n:</strong> {selectedEvaluacion.puntuacion_total}/{selectedEvaluacion.puntuacion_maxima} ({selectedEvaluacion.porcentaje_acierto.toFixed(1)}%)</div>
                  )}
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <Button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Evaluaciones;


