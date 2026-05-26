import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import SidebarErrorBoundary from "@/components/SidebarErrorBoundary";
import { authService } from '@/services/auth';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  Users, 
  UserCheck, 
  ClipboardList, 
  Brain, 
  RefreshCw, 
  Database,
  ArrowRight,
  UserPlus,
  Key,
  FileText,
  Activity,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

export function HomePage() {
  const currentUser = authService.getUserFromStorage();
  const { metrics, loading, error, refetch } = useDashboardMetrics();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  // Modern Harmonies Color Palette
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

  // Formatting Data for Recharts
  const evaluacionesData = metrics.evaluaciones_por_mes.map(item => ({
    mes: item.mes,
    evaluaciones: item.cantidad
  }));

  const pacientesEdadData = metrics.pacientes_por_edad.map(item => ({
    rango: item.rango_edad,
    cantidad: item.cantidad
  }));

  const totalEvaluacionesTipo = metrics.evaluaciones_por_tipo.reduce((acc, curr) => acc + curr.cantidad, 0);

  const evaluacionesTipoData = metrics.evaluaciones_por_tipo.map(item => ({
    tipo: item.tipo,
    cantidad: item.cantidad
  }));

  // Chart Configurations (Shadcn style)
  const evalChartConfig = {
    evaluaciones: {
      label: "Evaluaciones",
      color: "var(--color-chart-1)",
    }
  } satisfies ChartConfig;

  const ageChartConfig = {
    cantidad: {
      label: "Pacientes",
      color: "var(--color-chart-2)",
    }
  } satisfies ChartConfig;

  const typeChartConfig = {
    cantidad: {
      label: "Evaluaciones",
    }
  } satisfies ChartConfig;

  return (
    <SidebarProvider>
      <SidebarErrorBoundary>
        <AppSidebar 
          user={sidebarUser} 
          onLogout={handleLogout} 
        />
      </SidebarErrorBoundary>
      <SidebarInset>
        <main className="flex-1 p-8 bg-[#f8fafc] min-h-screen overflow-y-auto scroll-shadows-container" style={{ scrollbarGutter: 'stable' }}>
          
          {/* Header section with Greeting and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/30 flex items-center gap-1.5 animate-pulse">
                  <Database className="w-3.5 h-3.5" />
                  Base de Datos Conectada
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950">
                Dashboard de Investigación
              </h1>
              <p className="text-slate-500 font-medium mt-1 leading-relaxed">
                Sistema integrado de análisis cognitivo y evaluaciones de deterioro mental
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-all shadow-sm cursor-pointer hover:shadow"
              >
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
              <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-red-900">Error de comunicación</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-8 animate-fade-in">
              
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Active Users */}
                <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cq-wrapper">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
                  <CardContent className="p-5">
                    <div className="cq-kpi-card-layout">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Usuarios Activos
                        </p>
                        <div className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          {metrics.usuarios_activos}
                        </div>
                      </div>
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 w-fit shrink-0">
                        <Users className="h-5.5 w-5.5" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-3 border-t border-slate-50 pt-2">
                      Cuentas activas en la plataforma
                    </p>
                  </CardContent>
                </Card>

                {/* Patients registered */}
                <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cq-wrapper">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                  <CardContent className="p-5">
                    <div className="cq-kpi-card-layout">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Pacientes Registrados
                        </p>
                        <div className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {metrics.pacientes_registrados}
                        </div>
                      </div>
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 w-fit shrink-0">
                        <UserCheck className="h-5.5 w-5.5" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-3 border-t border-slate-50 pt-2">
                      Adultos mayores de 65 años
                    </p>
                  </CardContent>
                </Card>

                {/* Evaluations */}
                <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cq-wrapper">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-violet-500" />
                  <CardContent className="p-5">
                    <div className="cq-kpi-card-layout">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Evaluaciones
                        </p>
                        <div className="text-3xl font-black text-slate-900 group-hover:text-violet-600 transition-colors">
                          {metrics.evaluaciones_realizadas}
                        </div>
                      </div>
                      <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl group-hover:bg-violet-500 group-hover:text-white transition-colors duration-300 w-fit shrink-0">
                        <ClipboardList className="h-5.5 w-5.5" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-3 border-t border-slate-50 pt-2">
                      CDT, MMSE y Fluidez Verbal
                    </p>
                  </CardContent>
                </Card>

                {/* Neuropsychologists */}
                <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cq-wrapper">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                  <CardContent className="p-5">
                    <div className="cq-kpi-card-layout">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Neuropsicólogos
                        </p>
                        <div className="text-3xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                          {metrics.neuropsicologos_activos}
                        </div>
                      </div>
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 w-fit shrink-0">
                        <Brain className="h-5.5 w-5.5" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-3 border-t border-slate-50 pt-2">
                      Profesionales activos en el sistema
                    </p>
                  </CardContent>
                </Card>

              </div>

              {/* Central Section: Charts & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Evaluaciones por Mes (AreaChart) - spans 8 */}
                <Card className="lg:col-span-8 bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
                  <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">
                        Histórico de Evaluaciones
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-xs mt-0.5">
                        Tendencia mensual de evaluaciones clínicas aplicadas
                      </CardDescription>
                    </div>
                    <span className="p-2.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-xl flex items-center gap-1.5 text-xs font-semibold">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Últimos meses
                    </span>
                  </CardHeader>
                  <CardContent className="p-0">
                    {evaluacionesData.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <p className="text-slate-400 text-sm font-medium">No hay suficientes datos registrados</p>
                      </div>
                    ) : (
                      <ChartContainer config={evalChartConfig} className="h-[300px] w-full">
                        <AreaChart data={evaluacionesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorEvaluaciones" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100" />
                          <XAxis 
                            dataKey="mes" 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                            className="fill-slate-400 text-[11px] font-semibold"
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false}
                            dx={-10}
                            className="fill-slate-400 text-[11px] font-semibold"
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area 
                            type="monotone" 
                            dataKey="evaluaciones" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorEvaluaciones)" 
                          />
                        </AreaChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Distribución por Tipo (Donut PieChart) - spans 4 */}
                <Card className="lg:col-span-4 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col cq-wrapper">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800">
                      Tipos de Evaluaciones
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs mt-0.5">
                      Proporción por tipo de instrumento cognitivo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col justify-center">
                    {evaluacionesTipoData.length === 0 ? (
                      <div className="h-[240px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <p className="text-slate-400 text-sm font-medium">Sin datos de pruebas</p>
                      </div>
                    ) : (
                      <div className="cq-donut-layout">
                        <div className="relative aspect-square max-h-[180px] mx-auto w-full my-auto">
                          <ChartContainer config={typeChartConfig} className="w-full h-full">
                            <PieChart>
                              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                              <Pie
                                data={evaluacionesTipoData}
                                dataKey="cantidad"
                                nameKey="tipo"
                                innerRadius={55}
                                outerRadius={75}
                                strokeWidth={4}
                                stroke="#fff"
                              >
                                {evaluacionesTipoData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ChartContainer>
                          
                          {/* Inner center text for Total */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[24px] font-black text-slate-800 leading-none">
                              {totalEvaluacionesTipo}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                              Pruebas
                            </span>
                          </div>
                        </div>

                        {/* Beautiful list-legend */}
                        <div className="flex flex-col gap-2 justify-center">
                          {evaluacionesTipoData.map((item, index) => (
                            <div key={item.tipo} className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                              <span 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                              />
                              <div className="min-w-0">
                                <p className="text-[10px] font-extrabold text-slate-700 truncate leading-none">
                                  {item.tipo}
                                </p>
                                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">
                                  {item.cantidad} ({totalEvaluacionesTipo > 0 ? Math.round((item.cantidad / totalEvaluacionesTipo) * 100) : 0}%)
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Lower Section: Age Distribution & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Distribución por Edad (BarChart) - spans 7 */}
                <Card className="lg:col-span-7 bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-lg font-bold text-slate-800">
                      Distribución por Rangos de Edad
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs mt-0.5">
                      Número de pacientes distribuidos según rango etario actual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {pacientesEdadData.length === 0 ? (
                      <div className="h-[280px] flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <p className="text-slate-400 text-sm font-medium">No hay pacientes con edad registrada</p>
                      </div>
                    ) : (
                      <ChartContainer config={ageChartConfig} className="h-[280px] w-full">
                        <BarChart data={pacientesEdadData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100" />
                          <XAxis 
                            dataKey="rango" 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                            className="fill-slate-400 text-[11px] font-semibold"
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false}
                            dx={-10}
                            className="fill-slate-400 text-[11px] font-semibold"
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar 
                            dataKey="cantidad" 
                            fill="#10B981" 
                            radius={[6, 6, 0, 0]}
                            maxBarSize={45}
                          />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions and Panel - spans 5 */}
                <Card className="lg:col-span-5 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800">
                        Accesos Directos del Investigador
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-xs mt-0.5">
                        Operaciones clínicas y configuraciones prioritarias del protocolo
                      </CardDescription>
                    </CardHeader>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      
                      {/* Register Patient */}
                      <Link 
                        to="/pacientes" 
                        className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 rounded-2xl group transition-all duration-300 hover:shadow-sm"
                      >
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1 group-hover:text-blue-700 transition-colors">
                            Registrar Paciente
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Añadir datos y perfil clínico</p>
                        </div>
                      </Link>

                      {/* Access Codes */}
                      <Link 
                        to="/codigos-acceso" 
                        className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 rounded-2xl group transition-all duration-300 hover:shadow-sm"
                      >
                        <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                          <Key className="w-5 h-5" />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1 group-hover:text-emerald-700 transition-colors">
                            Asignar Códigos
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Generar tokens de evaluación</p>
                        </div>
                      </Link>

                      {/* View Results */}
                      <Link 
                        to="/resultados" 
                        className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 rounded-2xl group transition-all duration-300 hover:shadow-sm"
                      >
                        <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl w-fit group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1 group-hover:text-violet-700 transition-colors">
                            Resultados e IA
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Ver diagnósticos y reportes</p>
                        </div>
                      </Link>

                      {/* MMSE Config */}
                      <Link 
                        to="/configuracion/mmse" 
                        className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 rounded-2xl group transition-all duration-300 hover:shadow-sm"
                      >
                        <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl w-fit group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                          <Brain className="w-5 h-5" />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1 group-hover:text-amber-700 transition-colors">
                            Configurar MMSE
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Gestionar categorías y puntajes</p>
                        </div>
                      </Link>

                    </div>
                  </div>
                  
                  {/* System disclaimer for security */}
                  <div className="mt-6 p-3 bg-blue-50/30 border border-blue-100/50 rounded-2xl text-[10px] font-medium text-slate-500 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                    <span>
                      Este panel es estrictamente académico para fines de investigación de tesis. La clasificación mediante algoritmos de inteligencia artificial es consultiva y debe validarse clínicamente.
                    </span>
                  </div>

                </Card>

              </div>

            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Beautiful Pulsing Skeleton Loader component for LCP/UX stability
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      
      {/* Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 h-28 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="h-7 bg-slate-200 rounded w-16 mt-2"></div>
          </div>
        ))}
      </div>

      {/* Skeleton Central Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 h-[390px] flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-48"></div>
            <div className="h-3 bg-slate-200 rounded w-72"></div>
          </div>
          <div className="h-[270px] bg-slate-50 rounded-2xl w-full"></div>
        </div>
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 h-[390px] flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-36"></div>
            <div className="h-3 bg-slate-200 rounded w-48"></div>
          </div>
          <div className="h-[180px] bg-slate-50 rounded-full w-[180px] mx-auto flex items-center justify-center">
            <div className="h-[120px] bg-white rounded-full w-[120px]" />
          </div>
          <div className="h-8 bg-slate-200 rounded w-full"></div>
        </div>
      </div>

      {/* Skeleton Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 h-[370px] flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-52"></div>
            <div className="h-3 bg-slate-200 rounded w-80"></div>
          </div>
          <div className="h-[250px] bg-slate-50 rounded-2xl w-full"></div>
        </div>
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 h-[370px] flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-60"></div>
            <div className="h-3 bg-slate-200 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 h-[240px] mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
                <div className="h-8 w-8 bg-slate-200 rounded-xl" />
                <div className="h-3 bg-slate-200 rounded w-16 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
