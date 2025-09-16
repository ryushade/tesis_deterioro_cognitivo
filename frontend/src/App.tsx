import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import Pacientes from './pages/Pacientes/PacientesSimple';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthorizationService } from './services/auth.middleware';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const isAuthStored = localStorage.getItem('isAuthenticated') === 'true';
      
      if (token && isAuthStored) {
        try {
          // Simple JWT expiration check (JWT format: header.payload.signature)
          if (token.split('.').length === 3) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = Date.now() >= payload.exp * 1000;
            setIsAuthenticated(!isExpired);
            
            if (isExpired) {
              // Clean up expired token
              localStorage.removeItem('authToken');
              localStorage.removeItem('isAuthenticated');
              localStorage.removeItem('user');
              setIsAuthenticated(false);
            }
          } else {
            // Invalid token format
            setIsAuthenticated(false);
            localStorage.removeItem('authToken');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
          }
        } catch (error: any) {
          console.error('Token validation error:', error);
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for login events
    const handleLoginSuccess = () => {
      setTimeout(() => {
        checkAuth();
      }, 100); // Small delay to ensure localStorage is updated
    };

    const handleAuthStateChanged = () => {
      setTimeout(() => {
        checkAuth();
      }, 100);
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('authStateChanged', handleAuthStateChanged);
    
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('authStateChanged', handleAuthStateChanged);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  // Debug: Check authentication state
  console.log('Auth state:', { 
    isAuthenticated, 
    token: !!localStorage.getItem('authToken'),
    isAuthStored: localStorage.getItem('isAuthenticated') === 'true'
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes"
              element={
                <ProtectedRoute requiredRoles={['Administrador', 'Neuropsicólogo']}>
                  <Pacientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <Navigate to={isAuthenticated ? AuthorizationService.getDefaultRoute() : "/login"} replace />
              }
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
