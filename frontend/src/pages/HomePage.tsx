import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import SidebarErrorBoundary from "@/components/SidebarErrorBoundary";
import { authService } from '@/services/auth';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCheck, ClipboardList, Brain } from 'lucide-react';

export function HomePage() {
  // Get user data from localStorage
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

  // Colores para los gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Datos para el gráfico de evaluaciones por mes
  const evaluacionesData = metrics.evaluaciones_por_mes.map(item => ({
    mes: item.mes,
    evaluaciones: item.cantidad
  }));

  // Datos para el gráfico de pacientes por edad
  const pacientesEdadData = metrics.pacientes_por_edad.map(item => ({
    rango: item.rango_edad,
    cantidad: item.cantidad
  }));

  // Datos para el gráfico de evaluaciones por tipo
  const evaluacionesTipoData = metrics.evaluaciones_por_tipo.map(item => ({
    tipo: item.tipo,
    cantidad: item.cantidad
  }));

  return (
    <SidebarProvider>
      <SidebarErrorBoundary>
        <AppSidebar 
          user={sidebarUser} 
          onLogout={handleLogout} 
        />
      </SidebarErrorBoundary>
      <SidebarInset>
        <main className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
          <div className="mb-8">
           <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Dashboard Principal
           </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Panel de control del sistema de evaluaciones cognitivas
            </p>
          </div>

          {/* KPIs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Usuarios Activos
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    metrics.usuarios_activos
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Total de usuarios del sistema
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Pacientes Registrados
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    metrics.pacientes_registrados
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Pacientes en el sistema
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Evaluaciones Realizadas
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    metrics.evaluaciones_realizadas
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Total de evaluaciones completadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Neuropsicólogos
                </CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Brain className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    metrics.neuropsicologos_activos
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Profesionales activos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Evaluaciones por Mes */}
            <Card className="bg-white shadow-xl border-0 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Evaluaciones por Mes</CardTitle>
                <CardDescription className="text-gray-600">
                  Tendencia de evaluaciones realizadas en los últimos meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evaluacionesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#666"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="evaluaciones" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pacientes por Edad */}
            <Card className="bg-white shadow-xl border-0 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Distribución por Edad</CardTitle>
                <CardDescription className="text-gray-600">
                  Distribución de pacientes por rangos de edad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pacientesEdadData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="rango" 
                        stroke="#666"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="cantidad" 
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evaluaciones por Tipo */}
          {evaluacionesTipoData.length > 0 && (
            <Card className="mb-8 bg-white shadow-xl border-0 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Evaluaciones por Tipo</CardTitle>
                <CardDescription className="text-gray-600">
                  Distribución de evaluaciones según su tipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={evaluacionesTipoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ tipo, cantidad }) => `${tipo}: ${cantidad}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="cantidad"
                      >
                        {evaluacionesTipoData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
