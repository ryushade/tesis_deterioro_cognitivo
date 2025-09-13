import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthorizationService } from '../../services/auth.middleware';
import { authService } from '../../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requireAuth?: boolean;
  fallbackRoute?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuth = true,
  fallbackRoute = '/login'
}) => {
  // Check if authentication is required and user is authenticated
  if (requireAuth && !authService.isAuthenticated()) {
    return <Navigate to={fallbackRoute} replace />;
  }

  // Check if specific roles are required
  if (requiredRoles.length > 0) {
    const permissionCheck = AuthorizationService.checkPermission(requiredRoles);
    
    if (!permissionCheck.hasPermission) {
      // You could create a custom 403 page instead of redirecting to login
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">403 - Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">{permissionCheck.message}</p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// HOC para proteger componentes específicos
export const withRoleProtection = (
  Component: React.ComponentType<any>,
  requiredRoles: string[]
) => {
  return (props: any) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Componente para mostrar contenido basado en roles
export const RoleBasedComponent: React.FC<{
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ allowedRoles, children, fallback = null }) => {
  const hasPermission = AuthorizationService.hasRole(allowedRoles);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default ProtectedRoute;
