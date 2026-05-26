import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb";
import SidebarErrorBoundary from "@/components/SidebarErrorBoundary";
import { authService } from '@/services/auth';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Pie,
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
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

export function HomePage() {
  const currentUser = authService.getUserFromStorage();
  const { metrics, loading, error } = useDashboardMetrics();

  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido',
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  const evaluacionesData = metrics.evaluaciones_por_mes.map((item) => ({
    mes: item.mes,
    evaluaciones: item.cantidad,
  }));

  const pacientesEdadData = metrics.pacientes_por_edad.map((item) => ({
    rango: item.rango_edad,
    cantidad: item.cantidad,
  }));

  const totalEvaluacionesTipo = metrics.evaluaciones_por_tipo.reduce(
    (acc, curr) => acc + curr.cantidad,
    0
  );

  const evaluacionesTipoData = metrics.evaluaciones_por_tipo.map((item) => ({
    tipo: item.tipo,
    cantidad: item.cantidad,
  }));

  const evalChartConfig = {
    evaluaciones: {
      label: "Evaluaciones",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const ageChartConfig = {
    cantidad: {
      label: "Pacientes",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const typeChartConfig = {
    cantidad: {
      label: "Evaluaciones",
    },
  } satisfies ChartConfig;

  return (
    <SidebarProvider>
      <SidebarErrorBoundary>
        <AppSidebar user={sidebarUser} onLogout={handleLogout} />
      </SidebarErrorBoundary>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <DynamicBreadcrumb />
        </header>
        <main
          className="flex-1 bg-background min-h-screen overflow-y-auto scroll-shadows-container relative"
          style={{ scrollbarGutter: 'stable' }}
        >
          <div className="indicator-top" />
          <div className="flex flex-col gap-2 p-4 pt-6 md:p-4">

            {/* Page header */}
            <div className="flex flex-col gap-1">
              <h1 className="font-black text-5xl text-blue-900 tracking-tight mb-3">
                Dashboard de investigación
              </h1>
              <p className="text-muted-foreground text-sm">
                Análisis de pruebas cognitivas y métricas clínicas de deterioro mental
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <Activity className="h-4 w-4 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Error de comunicación</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <DashboardSkeleton />
            ) : (
              <div className="flex flex-col gap-4">

                {/* ── KPI Cards ── */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Usuarios activos
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.usuarios_activos}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cuentas habilitadas en el sistema
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pacientes registrados
                      </CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.pacientes_registrados}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pacientes en la base de datos
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Evaluaciones
                      </CardTitle>
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.evaluaciones_realizadas}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pruebas clínicas aplicadas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Neuropsicólogos
                      </CardTitle>
                      <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.neuropsicologos_activos}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Profesionales activos en el sistema
                      </p>
                    </CardContent>
                  </Card>

                </div>

                {/* ── Charts row ── */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                  {/* Area chart — spans 4 */}
                  <Card className="lg:col-span-4 flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="grid gap-0.5">
                        <CardTitle>Histórico de evaluaciones</CardTitle>
                        <CardDescription>
                          Tendencia mensual de evaluaciones clínicas aplicadas
                        </CardDescription>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Mensual
                      </span>
                    </CardHeader>
                    <CardContent className="pl-2 flex-1 flex flex-col">
                      {evaluacionesData.length === 0 ? (
                        <div className="flex flex-1 min-h-[220px] items-center justify-center rounded-lg border border-dashed">
                          <p className="text-sm text-muted-foreground">
                            No hay suficientes datos registrados
                          </p>
                        </div>
                      ) : (
                        <ChartContainer config={evalChartConfig} className="flex-1 aspect-auto min-h-[220px] w-full">
                          <AreaChart
                            data={evaluacionesData}
                            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorEvaluaciones" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="mes"
                              tickLine={false}
                              axisLine={false}
                              dy={10}
                              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              dx={-10}
                              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="evaluaciones"
                              stroke="var(--chart-1)"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorEvaluaciones)"
                            />
                          </AreaChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* Donut chart — spans 3 */}
                  <Card className="lg:col-span-3 cq-wrapper flex flex-col">
                    <CardHeader>
                      <CardTitle>Tipos de evaluaciones</CardTitle>
                      <CardDescription>
                        Proporción por tipo de instrumento cognitivo
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4 justify-center">
                      {evaluacionesTipoData.length === 0 ? (
                        <div className="flex flex-1 min-h-[190px] items-center justify-center rounded-lg border border-dashed">
                          <p className="text-sm text-muted-foreground">Sin datos de pruebas</p>
                        </div>
                      ) : (
                        <div className="cq-donut-layout">
                          <div className="relative aspect-square max-h-[130px] mx-auto w-full">
                            <ChartContainer config={typeChartConfig} className="h-full w-full">
                              <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie
                                  data={evaluacionesTipoData}
                                  dataKey="cantidad"
                                  nameKey="tipo"
                                  innerRadius={42}
                                  outerRadius={56}
                                  strokeWidth={3}
                                  stroke="var(--card)"
                                >
                                  {evaluacionesTipoData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ChartContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-xl font-bold">{totalEvaluacionesTipo}</span>
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                Pruebas
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {evaluacionesTipoData.map((item, index) => (
                              <div key={item.tipo} className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                                  <p className="text-xs font-medium truncate">{item.tipo}</p>
                                  <p className="text-xs text-muted-foreground shrink-0">
                                    {item.cantidad}
                                    {totalEvaluacionesTipo > 0
                                      ? ` (${Math.round((item.cantidad / totalEvaluacionesTipo) * 100)}%)`
                                      : ''}
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

                {/* ── Bottom row ── */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                  {/* Bar chart — spans 4 */}
                  <Card className="lg:col-span-4 flex flex-col">
                    <CardHeader>
                      <CardTitle>Rangos de edad de pacientes</CardTitle>
                      <CardDescription>
                        Número de pacientes distribuidos según rango etario actual
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2 flex-1 flex flex-col">
                      {pacientesEdadData.length === 0 ? (
                        <div className="flex flex-1 min-h-[220px] items-center justify-center rounded-lg border border-dashed">
                          <p className="text-sm text-muted-foreground">
                            No hay pacientes con edad registrada
                          </p>
                        </div>
                      ) : (
                        <ChartContainer config={ageChartConfig} className="flex-1 aspect-auto min-h-[220px] w-full">
                          <BarChart
                            data={pacientesEdadData}
                            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="rango"
                              tickLine={false}
                              axisLine={false}
                              dy={10}
                              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              dx={-10}
                              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                              dataKey="cantidad"
                              fill="var(--chart-2)"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={40}
                            />
                          </BarChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick actions — spans 3 */}
                  <Card className="lg:col-span-3 flex flex-col">
                    <CardHeader>
                      <CardTitle>Accesos directos</CardTitle>
                      <CardDescription>
                        Operaciones de gestión y control del protocolo clínico
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="divide-y divide-border">

                        <Link
                          to="/pacientes"
                          className="flex items-center justify-between py-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <UserPlus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                            <div>
                              <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                                Registrar paciente
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Añadir datos y perfil clínico
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>

                        <Link
                          to="/codigos-acceso"
                          className="flex items-center justify-between py-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                            <div>
                              <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                                Asignar códigos
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Generar tokens de evaluación
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>

                        <Link
                          to="/resultados"
                          className="flex items-center justify-between py-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                            <div>
                              <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                                Resultados de evaluaciones
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ver diagnósticos y reportes de IA
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>

                        <Link
                          to="/configuracion/mmse"
                          className="flex items-center justify-between py-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <Brain className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                            <div>
                              <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                                Configurar pruebas MMSE
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Gestionar categorías y puntajes mínimos
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>

                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Panel de uso académico para investigación. La clasificación automática de la IA es consultiva y debe ser verificada clínicamente por profesionales.
                      </p>
                    </CardFooter>
                  </Card>

                </div>

              </div>
            )}
          </div>
          <div className="indicator-bottom" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Skeleton that mirrors the exact structure of the live layout for layout stability
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">

      {/* KPI skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-4 w-4 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-14 rounded bg-muted" />
              <div className="mt-1 h-3 w-32 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="grid gap-1.5">
              <div className="h-4 w-44 rounded bg-muted" />
              <div className="h-3 w-64 rounded bg-muted" />
            </div>
            <div className="h-7 w-20 rounded-lg bg-muted" />
          </CardHeader>
          <CardContent className="pl-2 flex-1 flex flex-col">
            <div className="h-[220px] w-full rounded-lg bg-muted flex-1" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-3 w-52 rounded bg-muted" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 justify-center">
            <div className="mx-auto h-[130px] w-[130px] rounded-full bg-muted" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted shrink-0" />
                  <div className="h-3 flex-1 rounded bg-muted" />
                  <div className="h-3 w-14 rounded bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader>
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-3 w-72 rounded bg-muted" />
          </CardHeader>
          <CardContent className="pl-2 flex-1 flex flex-col">
            <div className="h-[220px] w-full rounded-lg bg-muted flex-1" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-3 w-56 rounded bg-muted" />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="divide-y divide-border">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded bg-muted shrink-0" />
                    <div className="grid gap-1">
                      <div className="h-3 w-28 rounded bg-muted" />
                      <div className="h-3 w-40 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="h-4 w-4 rounded bg-muted shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="h-3 w-full rounded bg-muted" />
          </CardFooter>
        </Card>
      </div>

    </div>
  );
}
