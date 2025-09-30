import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import SidebarErrorBoundary from "@/components/SidebarErrorBoundary";
import { authService } from '@/services/auth';

export function HomePage() {
  // Get user data from localStorage
  const currentUser = authService.getUserFromStorage();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  return (
    <SidebarProvider>
      <SidebarErrorBoundary>
        <AppSidebar 
          user={sidebarUser} 
          onLogout={handleLogout} 
        />
      </SidebarErrorBoundary>
      <SidebarInset>
        <main className="flex-1 p-6">
          <div className="mb-8">
           <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-600 to-indigo-600 mb-3">
              Dashboard Principal
           </h1>
            <p className="text-lg font-medium text-gray-600 leading-relaxed">
              Visualiza el panel general del sistema y accede a las funcionalidades principales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Usuarios activos</h3>
              <p className="text-4xl font-black text-blue-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pacientes registrados</h3>
              <p className="text-4xl font-black text-green-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Evaluaciones realizadas</h3>
              <p className="text-4xl font-black text-purple-600">0</p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
