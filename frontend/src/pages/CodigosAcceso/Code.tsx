import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';

function CodigosAcceso() {
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
                Gestión de códigos de acceso
              </h1>
              <p className="text-lg font-medium text-blue-700/80 leading-relaxed">
                Gestiona los códigos de acceso para las evaluaciones del deterioro cognitivo.
              </p>
            </div>
          </div>
          
          <Button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
          >
            <Plus className="h-4 w-4" />
            Agregar código
          </Button>
        </div>

        {/* ... AQUÍ PUEDES COMENZAR A ESCRIBIR TU TABLA Y MODALES ... */}
        
      </div>
    </DashboardLayout>
  );
}

export default CodigosAcceso;
