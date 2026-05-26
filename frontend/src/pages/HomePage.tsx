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
  const { metrics, loading, error } = useDashboardMetrics();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  // Curated, solid color palette for data visualizations (no garish colors)
  const COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#db2777', '#ea580c', '#0891b2'];

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
        {/* Main layout scroll shadow container */}
        <main className="flex-1 bg-[#f8fafc] min-h-screen overflow-y-auto scroll-shadows-container relative" style={{ scrollbarGutter: 'stable' }}>
          {/* Scroll indicators for modern browser scroll-state queries */}
          <div className="indicator-top"></div>
          <div className="p-4">
          
          {/* Header section - clean typography without gradients or overdecoration */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                Dashboard de Investigación
              </h1>
              <p className="text-slate-400 text-xs font-semibold mt-0.5 leading-relaxed">
                Análisis de pruebas cognitivas y métricas clínicas de deterioro mental
              </p>
            </div>
            

          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-8 p-4 bg-red-50/50 border border-red-200/80 rounded-xl flex items-center gap-3 animate-fade-in">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-900">Error de comunicación</p>
                <p className="text-[10px] font-semibold text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-5 animate-fade-in">
              
              {/* KPI Cards Grid - high density, clean border styles, no nested card badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Active Users */}
                <Card className="bg-white border border-slate-200/60 shadow-sm rounded-xl hover:border-slate-300 transition-all duration-150 group cq-wrapper">
                  <CardContent className="p-4">
                    <div className="cq-kpi-card-layout">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Usuarios Activos
                        </span>
                        <div className="text-2xl font-extrabold text-slate-800">
                          {metrics.usuarios_activos}
                        </div>
                      </div>
                      <Users className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                {/* Patients registered */}
                <Card className="bg-white border border-slate-200/60 shadow-sm rounded-xl hover:border-slate-300 transition-all duration-150 group cq-wrapper">
                  <CardContent className="p-4">
                    <div className="cq-kpi-card-layout">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Pacientes Registrados
                        </span>
                        <div className="text-2xl font-extrabold text-slate-800">
                          {metrics.pacientes_registrados}
                        </div>
                      </div>
                      <UserCheck className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                {/* Evaluations */}
                <Card className="bg-white border border-slate-200/60 shadow-sm rounded-xl hover:border-slate-300 transition-all duration-150 group cq-wrapper">
                  <CardContent className="p-4">
                    <div className="cq-kpi-card-layout">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Evaluaciones
                        </span>
                        <div className="text-2xl font-extrabold text-slate-800">
                          {metrics.evaluaciones_realizadas}
                        </div>
                      </div>
                      <ClipboardList className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                {/* Neuropsychologists */}
                <Card className="bg-white border border-slate-200/60 shadow-sm rounded-xl hover:border-slate-300 transition-all duration-150 group cq-wrapper">
                  <CardContent className="p-4">
                    <div className="cq-kpi-card-layout">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Neuropsicólogos
                        </span>
                        <div className="text-2xl font-extrabold text-slate-800">
                          {metrics.neuropsicologos_activos}
                        </div>
                      </div>
                      <Brain className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Central Section: Charts & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Evaluaciones por Mes (AreaChart) - spans 8 */}
                <Card className="lg:col-span-8 bg-white border border-slate-200/60 shadow-sm rounded-xl p-4">
                  <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800">
                        Histórico de evaluaciones
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-[10px] font-medium mt-0.5">
                        Tendencia mensual de evaluaciones clínicas aplicadas
                      </CardDescription>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Mensual
                    </span>
                  </CardHeader>
                  <CardContent className="p-0">
                    {evaluacionesData.length === 0 ? (
                      <div className="h-[220px] flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p className="text-slate-400 text-xs font-semibold">No hay suficientes datos registrados</p>
                      </div>
                    ) : (
                      <ChartContainer config={evalChartConfig} className="h-[220px] w-full">
                        <AreaChart data={evaluacionesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorEvaluaciones" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100" />
                          <XAxis 
                            dataKey="mes" 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                            className="fill-slate-400 text-[10px] font-bold"
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false}
                            dx={-10}
                            className="fill-slate-400 text-[10px] font-bold"
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area 
                            type="monotone" 
                            dataKey="evaluaciones" 
                            stroke="#2563eb" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#colorEvaluaciones)" 
                          />
                        </AreaChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Distribución por Tipo (Donut PieChart) - spans 4 */}
                <Card className="lg:col-span-4 bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 flex flex-col cq-wrapper">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-base font-bold text-slate-800">
                      Tipos de evaluaciones
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-[10px] font-medium mt-0.5">
                      Proporción por tipo de instrumento cognitivo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col justify-center">
                    {evaluacionesTipoData.length === 0 ? (
                      <div className="h-[190px] flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p className="text-slate-400 text-xs font-semibold">Sin datos de pruebas</p>
                      </div>
                    ) : (
                      <div className="cq-donut-layout">
                        <div className="relative aspect-square max-h-[125px] mx-auto w-full my-auto">
                          <ChartContainer config={typeChartConfig} className="w-full h-full">
                            <PieChart>
                              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                              <Pie
                                data={evaluacionesTipoData}
                                dataKey="cantidad"
                                nameKey="tipo"
                                innerRadius={42}
                                outerRadius={56}
                                strokeWidth={3}
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
                            <span className="text-lg font-bold text-slate-800 leading-none">
                              {totalEvaluacionesTipo}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                              Pruebas
                            </span>
                          </div>
                        </div>

                        {/* Beautiful minimal list-legend */}
                        <div className="flex flex-col gap-1.5 justify-center">
                          {evaluacionesTipoData.map((item, index) => (
                            <div key={item.tipo} className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
                              <span 
                                className="w-1.5 h-1.5 rounded-full shrink-0" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                              />
                              <div className="min-w-0">
                                <p className="text-[9px] font-bold text-slate-700 truncate leading-none">
                                  {item.tipo}
                                </p>
                                <p className="text-[8px] font-semibold text-slate-400 mt-0.5">
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Distribución por Edad (BarChart) - spans 7 */}
                <Card className="lg:col-span-7 bg-white border border-slate-200/60 shadow-sm rounded-xl p-4">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-base font-bold text-slate-800">
                      Rangos de Edad de Pacientes
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-[10px] font-medium mt-0.5">
                      Número de pacientes distribuidos según rango etario actual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {pacientesEdadData.length === 0 ? (
                      <div className="h-[220px] flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p className="text-slate-400 text-xs font-semibold">No hay pacientes con edad registrada</p>
                      </div>
                    ) : (
                      <ChartContainer config={ageChartConfig} className="h-[220px] w-full">
                        <BarChart data={pacientesEdadData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100" />
                          <XAxis 
                            dataKey="rango" 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                            className="fill-slate-400 text-[10px] font-bold"
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false}
                            dx={-10}
                            className="fill-slate-400 text-[10px] font-bold"
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar 
                            dataKey="cantidad" 
                            fill="#0d9488" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions (Notion-like list) - spans 5 */}
                <Card className="lg:col-span-5 bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-base font-bold text-slate-800">
                        Accesos Directos
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-[10px] font-medium mt-0.5">
                        Operaciones de gestión y control del protocolo clínico
                      </CardDescription>
                    </CardHeader>
                    
                    {/* Clean Action List (Flat, compact, borderless list to avoid nested cards and waste of space) */}
                    <div className="divide-y divide-slate-100 mt-1">
                      
                      {/* Register Patient */}
                      <Link 
                        to="/pacientes" 
                        className="flex items-center justify-between py-2 hover:bg-slate-50/60 px-2 rounded-lg transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3">
                          <UserPlus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                              Registrar Paciente
                            </span>
                            <span className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                              Añadir datos y perfil clínico
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-150" />
                      </Link>

                      {/* Access Codes */}
                      <Link 
                        to="/codigos-acceso" 
                        className="flex items-center justify-between py-2 hover:bg-slate-50/60 px-2 rounded-lg transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3">
                          <Key className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                              Asignar Códigos
                            </span>
                            <span className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                              Generar tokens de evaluación
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-150" />
                      </Link>

                      {/* View Results */}
                      <Link 
                        to="/resultados" 
                        className="flex items-center justify-between py-2 hover:bg-slate-50/60 px-2 rounded-lg transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                              Resultados de Evaluaciones
                            </span>
                            <span className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                              Ver diagnósticos y reportes de IA
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-150" />
                      </Link>

                      {/* MMSE Config */}
                      <Link 
                        to="/configuracion/mmse" 
                        className="flex items-center justify-between py-2 hover:bg-slate-50/60 px-2 rounded-lg transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3">
                          <Brain className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                              Configurar Pruebas MMSE
                            </span>
                            <span className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                              Gestionar categorías y puntajes mínimos
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-150" />
                      </Link>

                    </div>
                  </div>
                  
                  {/* System disclaimer for security */}
                  <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200/50 rounded-lg text-[10px] font-semibold text-slate-400 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                    <span>
                      Este panel es de uso académico para investigación. La clasificación automática de la IA es consultiva y debe ser verificada clínicamente por profesionales.
                    </span>
                  </div>

                </Card>

              </div>

            </div>
          )}
          </div>
          <div className="indicator-bottom"></div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Beautiful Pulsing Skeleton Loader component for LCP/UX stability (Clean, slop-free blocks)
function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      
      {/* Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200/60 rounded-xl p-4 h-[76px] flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-20"></div>
              <div className="h-5 bg-slate-100 rounded w-12"></div>
            </div>
            <div className="h-4 w-4 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Skeleton Central Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-xl p-4 h-[304px] flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-48"></div>
            <div className="h-3 bg-slate-100 rounded w-72"></div>
          </div>
          <div className="h-[210px] bg-slate-50 rounded-lg w-full"></div>
        </div>
        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-xl p-4 h-[304px] flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-36"></div>
            <div className="h-3 bg-slate-100 rounded w-48"></div>
          </div>
          <div className="h-[130px] bg-slate-50 rounded-full w-[130px] mx-auto flex items-center justify-center">
            <div className="h-[85px] bg-white rounded-full w-[85px]" />
          </div>
          <div className="h-7 bg-slate-100 rounded w-full"></div>
        </div>
      </div>

      {/* Skeleton Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-xl p-4 h-[304px] flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-52"></div>
            <div className="h-3 bg-slate-100 rounded w-80"></div>
          </div>
          <div className="h-[200px] bg-slate-50 rounded-lg w-full"></div>
        </div>
        <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-xl p-4 h-[304px] flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-60"></div>
            <div className="h-3 bg-slate-100 rounded w-64"></div>
          </div>
          <div className="space-y-1.5 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex justify-between items-center h-[34px]">
                <div className="h-3 bg-slate-200 rounded w-28" />
                <div className="h-3 w-3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
