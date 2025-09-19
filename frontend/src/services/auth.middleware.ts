import { authService } from './auth';

export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  access_type?: string;
}

export class AuthorizationService {
  /**
   * Verifica si el usuario actual tiene uno de los roles permitidos
   */
  static hasRole(allowedRoles: string[]): boolean {
    try {
      const user = authService.getCurrentUserSync();
      console.log('AuthorizationService.hasRole - User from sync:', user);
      console.log('AuthorizationService.hasRole - Allowed roles:', allowedRoles);
      
      if (!user || !user.role) {
        console.log('AuthorizationService.hasRole - No user or role found');
        return false;
      }
      
      const hasRole = allowedRoles.includes(user.role.name);
      console.log(`AuthorizationService.hasRole - User role: ${user.role.name}, Has role: ${hasRole}`);
      
      return hasRole;
    } catch (error) {
      console.error('AuthorizationService.hasRole - Error:', error);
      return false;
    }
  }

  /**
   * Verifica si el usuario es administrador
   */
  static isAdmin(): boolean {
    return this.hasRole(['Administrador']);
  }

  /**
   * Verifica si el usuario es neuropsicólogo o administrador
   */
  static isNeuropsicologo(): boolean {
    return this.hasRole(['Administrador', 'Neuropsicologo']);  // Sin tilde
  }

  /**
   * Verifica si el usuario es paciente
   */
  static isPatient(): boolean {
    const user = authService.getCurrentUserSync();
    return user?.role?.name === 'Paciente';
  }

  /**
   * Verifica si el usuario puede gestionar pacientes
   */
  static canManagePatients(): boolean {
    return this.hasRole(['Administrador', 'Neuropsicologo']);
  }

  /**
   * Verifica si el usuario puede ver estadísticas
   */
  static canViewStatistics(): boolean {
    return this.hasRole(['Administrador', 'Neuropsicologo']);
  }

  /**
   * Verifica si el usuario puede crear usuarios
   */
  static canManageUsers(): boolean {
    return this.hasRole(['Administrador']);
  }

  /**
   * Verifica si el usuario puede realizar pruebas cognitivas
   */
  static canTakeCognitiveTests(): boolean {
    // Todos los usuarios autenticados pueden realizar pruebas
    return authService.isAuthenticated();
  }

  /**
   * Verifica si el usuario puede ver resultados de otros pacientes
   */
  static canViewAllResults(): boolean {
    return this.hasRole(['Administrador', 'Neuropsicologo']);  // Sin tilde
  }

  /**
   * Obtiene las opciones de navegación basadas en el rol del usuario
   */
  static getNavigationOptions() {
    const options = {
      dashboard: true,
      patients: this.canManagePatients(),
      cognitiveTests: this.canTakeCognitiveTests(),
      results: this.canViewAllResults(),
      statistics: this.canViewStatistics(),
      userManagement: this.canManageUsers(),
      profile: true
    };

    return options;
  }

  /**
   * Redirecciona según el rol del usuario después del login
   */
  static getDefaultRoute(): string {
    if (this.isPatient()) {
      return '/pruebas'; // Los pacientes van directamente a las pruebas
    } else if (this.canManagePatients()) {
      return '/dashboard'; // Neuropsicólogos y admin van al dashboard
    } else {
      return '/'; // Ruta por defecto
    }
  }

  /**
   * Verifica permisos y retorna mensaje de error si no tiene acceso
   */
  static checkPermission(requiredRoles: string[]): { hasPermission: boolean; message?: string } {
    if (!authService.isAuthenticated()) {
      return {
        hasPermission: false,
        message: 'Debe iniciar sesión para acceder a esta función'
      };
    }

    if (!this.hasRole(requiredRoles)) {
      return {
        hasPermission: false,
        message: `Acceso denegado. Roles requeridos: ${requiredRoles.join(', ')}`
      };
    }

    return { hasPermission: true };
  }
}
