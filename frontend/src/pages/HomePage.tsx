import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserList } from '@/components/common/UserList';
import { UserForm } from '../components/common/UserForm';
import { useHealthCheck } from '../hooks/useUsers';
import { authService } from '@/services/auth';
import type { User } from '../types';

export function HomePage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { data: healthData } = useHealthCheck();

  // Get user data from localStorage
  const currentUser = authService.getUserFromStorage();
  
  const sidebarUser = {
    name: currentUser?.username || 'Usuario',
    email: currentUser?.role?.name || 'Rol no definido'
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  return (
    <SidebarProvider>
      <AppSidebar 
        user={sidebarUser} 
        onLogout={handleLogout}
      />
      <SidebarInset>
        <div className="container mx-auto py-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Principal
              </h1>
              <p className="text-gray-600 mt-1">
                Gestión de usuarios del sistema de análisis de deterioro cognitivo
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Button onClick={handleCreateUser}>
                Nuevo Usuario
              </Button>
              {healthData && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-lg text-green-800 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  API Conectada
                </div>
              )}
            </div>
          </header>

          <div className="grid gap-6">
            <div className="rounded-lg border p-6">
              {showForm ? (
                <UserForm
                  user={selectedUser || undefined}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              ) : (
                <UserList onEditUser={handleEditUser} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
