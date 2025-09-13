import React from 'react';
import { Button } from "@/components/ui/button";
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import type { User } from '../../types';

interface UserListProps {
  onEditUser?: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ onEditUser }) => {
  const { data: usersData, isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUserMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 text-lg">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600 text-lg bg-red-50 border border-red-200 rounded-lg px-6 py-4">
          Error al cargar usuarios
        </div>
      </div>
    );
  }

  if (!usersData?.data.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 text-lg bg-gray-100 rounded-lg px-6 py-4">
          No hay usuarios disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Lista de Usuarios</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersData.data.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Creado: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-2 mt-4">
              {onEditUser && (
                <Button
                  onClick={() => onEditUser(user)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Editar
                </Button>
              )}
              <Button
                onClick={() => handleDeleteUser(user.id)}
                variant="destructive"
                size="sm"
                disabled={deleteUserMutation.isPending}
                className="flex-1"
              >
                {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {usersData && (
        <div className="text-center py-4 text-gray-600 bg-gray-50 rounded-lg">
          Página {usersData.page} de {usersData.totalPages} 
          ({usersData.total} usuarios en total)
        </div>
      )}
    </div>
  );
};
