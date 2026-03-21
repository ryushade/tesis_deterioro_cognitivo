import { useCallback, useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
// import { useGetPacientes, type Paciente } from '@/services/pacientesService';
type Paciente = any;
const useGetPacientes = () => ({ pacientes: [], metadata: {}, loading: false, error: null, refetch: (a?:any,b?:any,c?:any) => {} });
// import { evaluacionesLiveService } from '@/services/evaluacionesLive.service';
const evaluacionesLiveService = { getByPaciente: async (id:any) => ({success: false, data: []}) };
// import { pruebasCognitivasService } from '@/services/pruebasCognitivas.service';
const pruebasCognitivasService = { getAll: async (opts:any) => ({success: false, data: []}) };
import type { EvaluacionCognitiva, PruebaCognitiva } from '@/types/evaluaciones';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MMSE from './ComponentsInicioPrueba/MMSE';
import Reloj from './ComponentsInicioPrueba/Reloj';
import Rey from './ComponentsInicioPrueba/Rey';

const REFRESH_INTERVAL_MS = 8000;
const PAGE_SIZES = [5, 10, 20] as const;

type FetchOptions = {
  silent?: boolean;
};

const ESTADOS = ['pendiente', 'procesando', 'completada', 'fallida'] as const;
type Estado = typeof ESTADOS[number];

const estadoEvaluacionStyle: Record<Estado, string> = {
  pendiente: 'bg-slate-100 text-slate-700',
  procesando: 'bg-amber-100 text-amber-700',
  completada: 'bg-emerald-100 text-emerald-700',
  fallida: 'bg-red-100 text-red-700',
};

const estadoLabels: Record<Estado, string> = {
  pendiente: 'Pendiente',
  procesando: 'Procesando',
  completada: 'Completada',
  fallida: 'Fallida',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatScore = (value?: number | null) => {
  if (value === null || value === undefined) return 'Pendiente';
  return `${value.toFixed(1)} / 10`;
};

const InicioPrueba = () => {
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(PAGE_SIZES[0]);

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionCognitiva[]>([]);
  const [pruebas, setPruebas] = useState<PruebaCognitiva[]>([]);
  const [pruebasLoading, setPruebasLoading] = useState(false);
  const [pruebasError, setPruebasError] = useState<string | null>(null);
  const [evaluacionesLoading, setEvaluacionesLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const {
    pacientes,
    metadata,
    loading: pacientesLoading,
    error: pacientesError,
    refetch,
  } = useGetPacientes();

  const currentUser = authService.getUserFromStorage();
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido',
  };

  const meta = metadata as unknown as {
    page?: number;
    total_pages?: number;
    has_next?: boolean;
    has_prev?: boolean;
    total?: number;
  };

  const sortedEvaluaciones = useMemo(() => {
    if (!evaluaciones?.length) return [];
    return [...evaluaciones].sort((a, b) => {
      const aDate = new Date(a.fecha_evaluacion || '').getTime();
      const bDate = new Date(b.fecha_evaluacion || '').getTime();
      return bDate - aDate;
    });
  }, [evaluaciones]);

  const activeEvaluation = useMemo(
    () =>
      sortedEvaluaciones.find(
        (item) =>
          item.estado_procesamiento === 'pendiente' ||
          item.estado_procesamiento === 'procesando',
      ),
    [sortedEvaluaciones],
  );

  const pruebasPorModo = useMemo(
    () => ({
      todas: pruebas,
      digital: pruebas.filter((item) => item.modo_aplicacion === 'digital'),
      papel: pruebas.filter((item) => item.modo_aplicacion === 'papel'),
    }),
    [pruebas],
  );

  type EvalStats = Record<Estado, number> & {
    total: number;
    lastCompleted: EvaluacionCognitiva | null;
  };

  const evaluationStats = useMemo<EvalStats>(() => {
    const base = ESTADOS.reduce((acc, e) => {
      acc[e] = 0;
      return acc;
    }, {} as Record<Estado, number>);

    evaluaciones.forEach((item) => {
      if (ESTADOS.includes(item.estado_procesamiento as Estado)) {
        base[item.estado_procesamiento as Estado] += 1;
      }
    });

    const total = evaluaciones.length;
    const lastCompleted =
      sortedEvaluaciones.find((item) => item.estado_procesamiento === 'completada') || null;

    return {
      ...base,
      total,
      lastCompleted,
    };
  }, [evaluaciones, sortedEvaluaciones]);

  const loadPruebas = useCallback(async () => {
    setPruebasLoading(true);
    setPruebasError(null);
    try {
      const response = await pruebasCognitivasService.getAll({ limit: 100, activo: true });
      if (response.success) {
        setPruebas(response.data || []);
      } else {
        setPruebas([]);
        setPruebasError(response.message || 'No se pudieron cargar las pruebas cognitivas');
      }
    } catch (error: unknown) {
      setPruebasError((error as Error)?.message || 'Error al cargar las pruebas cognitivas');
    } finally {
      setPruebasLoading(false);
    }
  }, []);

  const loadEvaluacionesForPaciente = useCallback(
    async (pacienteId: number, options: FetchOptions = {}) => {
      // Solo mostramos loading visible si NO es silencioso
      setEvaluacionesLoading(!options.silent);
      try {
        const response = await evaluacionesLiveService.getByPaciente(pacienteId);
        if (response.success) {
          setEvaluaciones(response.data || []);
          setLastRefresh(new Date());
        } else if (!options.silent) {
          toast.error(response.message || 'No se pudieron cargar las evaluaciones');
        }
      } catch (error: unknown) {
        if (!options.silent) {
          toast.error((error as Error)?.message || 'Error al cargar evaluaciones');
        }
      } finally {
        setEvaluacionesLoading(false);
      }
    },
    [],
  );

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    refetch(1, itemsPerPage, value);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    const targetPage = direction === 'prev' ? Math.max(1, currentPage - 1) : currentPage + 1;
    if ((direction === 'prev' && !meta?.has_prev) || (direction === 'next' && !meta?.has_next)) {
      return;
    }
    setCurrentPage(targetPage);
    refetch(targetPage, itemsPerPage, searchTerm);
  };

  useEffect(() => {
    loadPruebas();
  }, [loadPruebas]);

  const renderPruebas = (items: PruebaCognitiva[]) => {
    if (!items.length) {
      return <p className="text-sm text-gray-500">No hay pruebas para mostrar.</p>;
    }

    return (
      <div className="space-y-3">
        {items.map((prueba) => (
          <div
            key={prueba.id_prueba}
            className="rounded-md border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-gray-800">{prueba.nombre}</p>
                <p className="text-xs text-gray-500">Código {prueba.codigo}</p>
              </div>
              <div className="flex flex-col items-start gap-1 text-xs text-gray-500 sm:items-end">
                {prueba.puntaje_maximo !== undefined && prueba.puntaje_maximo !== null && (
                  <span>Puntaje máx {Number(prueba.puntaje_maximo).toFixed(1)}</span>
                )}
                <Badge className="font-medium">
                  {prueba.modo_aplicacion === 'digital' ? 'Digital' : 'Papel'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handlePageSizeChange = (value: string) => {
    const size = Number(value) || PAGE_SIZES[0];
    setItemsPerPage(size);
    setCurrentPage(1);
    refetch(1, size, searchTerm);
  };

  const handleSelectPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    loadEvaluacionesForPaciente(paciente.id_paciente);
  };

  // Polling en segundo plano cuando hay paciente seleccionado
  useEffect(() => {
    if (!selectedPaciente) return;
    const intervalId = window.setInterval(() => {
      loadEvaluacionesForPaciente(selectedPaciente.id_paciente, { silent: true });
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [selectedPaciente, loadEvaluacionesForPaciente]);

  return (
    <DashboardLayout user={sidebarUser} onLogout={handleLogout}>
      <Toaster position="top-right" />

      <div className="space-y-6">
        <header className="flex flex-col gap-2">
        <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-2">
          Seguimiento de evaluaciones cognitivas</h1>
        <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
            Selecciona una prueba y monitorea en tiempo real el estado cognitivo de los pacientes.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
          

          <div className="space-y-6">
          <div className='flex w-full flex-col gap-6'>
            <Tabs defaultValue="mmse">
              <TabsList className="gap-1">
                <TabsTrigger value="mmse" className="text-sm py-1.5">MMSE</TabsTrigger>
                <TabsTrigger value="reloj" className="text-sm py-1.5">Prueba del reloj</TabsTrigger>
                <TabsTrigger value="rey" className="text-sm py-1.5">Figura completa de rey</TabsTrigger>
              </TabsList>
              <TabsContent value="mmse">
                {/* Tabla de seguimiento MMSE */}
                <MMSE />
              </TabsContent>
              <TabsContent value="reloj">
                <Reloj />
              </TabsContent>
              <TabsContent value="rey">
                <Rey />
              </TabsContent>
            </Tabs>
          </div>

{/*             

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" /> Pruebas cognitivas disponibles
                </CardTitle>
                <CardDescription>
                  Consulta el catálogo de pruebas habilitadas por el equipo clínico.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pruebasLoading ? (
                  <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando pruebas
                  </div>
                ) : pruebasError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {pruebasError}
                  </div>
                ) : pruebas.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay pruebas registradas.</p>
                ) : (
                  
                )}
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InicioPrueba;
