
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import LoginPage from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import Pacientes from './pages/Pacientes/Pacientes';
import CodigosAcceso from './pages/CodigosAcceso/Code';
import Evaluaciones from './pages/Evaluaciones/Evaluaciones';

import MMSEPatient from './pages/Evaluaciones/ComponentsEvaluaciones/Pruebas/MMSE/MMSE';
import MMSEPausada from './pages/Evaluaciones/ComponentsEvaluaciones/Pruebas/MMSE/MMSEPausada';
// import Pruebas from './pages/Pruebas/Pruebas';
// import PruebaFinalizada from './pages/Pruebas/PruebaFinalizada';
import Neuropsicologos from './pages/Neuropsicologos/Neuropsicologo';
import Resultados from './pages/Resultados/Resultados';

import MMSEConfiguracionPage from './pages/Admin/MMSEConfiguracion';
// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthorizationService } from './services/auth.middleware';
// import InicioPrueba from './pages/InicioPrueba/InicioPrueba';

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const isAuthStored = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(!!token && isAuthStored);
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
          <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to={AuthorizationService.getDefaultRoute()} replace />
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
                  <ProtectedRoute requiredRoles={["Administrador", "Neuropsicologo"]}>
                    <Pacientes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pruebas-cognitivas"
                element={
                  <ProtectedRoute>
                    <Evaluaciones />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/codigos-acceso"
                element={
                  <ProtectedRoute requiredRoles={["Administrador", "Neuropsicologo"]}>
                    <CodigosAcceso />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/neuropsicologos"
                element={
                  <ProtectedRoute requiredRoles={["Administrador"]}>
                    <Neuropsicologos />
                  </ProtectedRoute>
                }
              />
              <Route
               path="/resultados"
               element={
                 <ProtectedRoute requiredRoles={["Administrador", "Neuropsicologo"]}>
                  <Resultados />
                 </ProtectedRoute>
               }
               />

              {/* <Route
                path="/evaluaciones"
                element={
                  <ProtectedRoute requiredRoles={["Neuropsicologo"]}>
                    <InicioPrueba />
                  </ProtectedRoute>
                }
              /> */}

              {/*
              <Route
                path="/cdt-test"
                element={
                  <ProtectedRoute>
                    <CDTTestPage />
                  </ProtectedRoute>
                }
              />
              */}
              {/* <Route
                path="/pruebas"
                element={
                  <ProtectedRoute>
                    <Pruebas />
                  </ProtectedRoute>
                }
              /> */}
              {/* <Route
                path="/pruebas/finalizado"
                element={
                  <ProtectedRoute>
                    <PruebaFinalizada />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/pruebas/pausada"
                element={
                  <ProtectedRoute>
                    <MMSEPausada />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mmse-configuracion"
                element={
                  <ProtectedRoute>
                    <MMSEConfiguracionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mmse"
                element={
                  <ProtectedRoute>
                    <MMSEPatient />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluaciones/mmse"
                element={
                  <ProtectedRoute>
                    <MMSEPatient />
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
