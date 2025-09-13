import { apiClient } from './api';

export interface User {
  id: number;
  username: string;
  role: {
    id: number;
    name: string;
  } | null;
}

export interface PatientLoginRequest {
  access_code: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role_id?: number;
}

export interface Role {
  id_rol: number;
  nom_rol: string;
  estado_rol: boolean;
}

class AuthService {
  private currentUser: User | null = null;

  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse & { token?: string }>('/auth/login', credentials);
      
      if (response.data.success && response.data.user && response.data.token) {
        this.currentUser = response.data.user;
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('authToken', response.data.token);
        
        // Trigger auth state change event
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // Patient login with access code
  async patientLogin(credentials: PatientLoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse & { token?: string }>('/auth/patient-login', credentials);
      
      if (response.data.success && response.data.user && response.data.token) {
        this.currentUser = response.data.user;
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('authToken', response.data.token);
        
        // Trigger auth state change event
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.currentUser = null;
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      
      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('authStateChanged'));
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<LoginResponse>('/auth/me');
      
      if (response.data.success && response.data.user) {
        this.currentUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      return null;
    }
  }

  // Get current user from localStorage (synchronous)
  getCurrentUserSync(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return this.currentUser;
    } catch {
      return null;
    }
  }

  // Verify token
  async verifyToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      const response = await apiClient.post<LoginResponse>('/auth/verify-token');
      
      if (response.data.success && response.data.user) {
        this.currentUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      this.logout();
      return false;
    }
  }

  // Register new user (admin only)
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Error al registrar usuario'
      };
    }
  }

  // Get all roles
  async getRoles(): Promise<Role[]> {
    try {
      const response = await apiClient.get<{ success: boolean; roles: Role[] }>('/auth/roles');
      
      if (response.data.success) {
        return response.data.roles;
      }
      
      return [];
    } catch (error) {
      console.error('Get roles error:', error);
      return [];
    }
  }

  // Initialize database
  async initDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/init-db');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Error al inicializar la base de datos'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  // Get user from localStorage
  getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Check if user has admin role
  isAdmin(user?: User | null): boolean {
    const currentUser = user || this.getUserFromStorage();
    return currentUser?.role?.name === 'Administrador';
  }

  // Get current user (cached)
  getCachedUser(): User | null {
    return this.currentUser || this.getUserFromStorage();
  }
}

export const authService = new AuthService();
