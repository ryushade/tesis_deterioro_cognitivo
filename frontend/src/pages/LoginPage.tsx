import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Brain, AlertCircle, Shield } from 'lucide-react';
import { authService } from '@/services/auth';
import { AuthorizationService } from '@/services/auth.middleware';

export default function LoginPage() {
  const navigate = useNavigate();
  
  // Estados para neuropsicólogo
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para paciente
  const [accessCode, setAccessCode] = useState('');
  
  // Estados generales
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInitButton, setShowInitButton] = useState(false);
  const [activeTab, setActiveTab] = useState('neuropsicologo');

  const handleNeurologistLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ username, password });
      
      if (response.success) {
        // Dispatch event to notify App component
        window.dispatchEvent(new CustomEvent('loginSuccess'));
        
        // Use React Router navigate instead of window.location.href
        const defaultRoute = AuthorizationService.getDefaultRoute();
        navigate(defaultRoute, { replace: true });
      } else {
        setError(response.message);
        
        // Show init button if it seems like database isn't initialized
        if (response.message.includes('Invalid credentials')) {
          setShowInitButton(true);
        }
      }
    } catch (error: any) {
      setError('Error de conexión con el servidor');
      setShowInitButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.patientLogin({ access_code: accessCode });
      
      if (response.success) {
        // Dispatch event to notify App component
        window.dispatchEvent(new CustomEvent('loginSuccess'));
        
        // Use React Router navigate for patient redirect
        navigate('/pruebas', { replace: true });
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitDatabase = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.initDatabase();
      
      if (result.success) {
        setError(''); // Clear error
        setShowInitButton(false);
        // Show success message
        alert(`${result.message}\nCredenciales por defecto:\nUsuario: admin\nContraseña: admin123`);
        
        // Pre-fill admin credentials
        setUsername('admin');
        setPassword('admin123');
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.message || 'Error al inicializar la base de datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black text-center tracking-tight">
            SISTEMA DETECCION DETERIORO COGNITIVO
          </CardTitle>
          <CardDescription className="text-center font-medium text-base">
            Selecciona tu tipo de acceso al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="neuropsicologo" className="flex items-center gap-2 font-semibold">
                Neuropsicólogo
              </TabsTrigger>
              <TabsTrigger value="administrador" className="flex items-center gap-2 font-semibold">
                Administrador
              </TabsTrigger>
              <TabsTrigger value="paciente" className="flex items-center gap-2 font-semibold">
                Paciente
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="neuropsicologo" className="space-y-4 mt-4">
              <form onSubmit={handleNeurologistLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>

              {showInitButton && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-3">
                    ¿Primera vez usando el sistema? Es posible que necesites inicializar la base de datos.
                  </p>
                  <Button 
                    onClick={handleInitDatabase}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inicializando...
                      </>
                    ) : (
                      'Inicializar Base de Datos'
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="administrador" className="space-y-4 mt-4">
              <form onSubmit={handleNeurologistLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Usuario</Label>
                  <Input
                    id="admin-username"
                    type="text"
                    placeholder="Ingresa nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Contraseña</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Acceso de Administrador
                    </>
                  )}
                </Button>
              </form>

              {showInitButton && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-3">
                    ¿Primera vez usando el sistema? Es posible que necesites inicializar la base de datos.
                  </p>
                  <Button 
                    onClick={handleInitDatabase}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inicializando...
                      </>
                    ) : (
                      'Inicializar Base de Datos'
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="paciente" className="space-y-4 mt-4">
              <form onSubmit={handlePatientLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Código de acceso</Label>
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder="Ingresa tu código de acceso"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                    disabled={isLoading}
                    className="text-center text-lg tracking-widest"
                    maxLength={8}
                  />
                </div>
                <div className="text-sm text-gray-600 text-center">
                  <p>Solicita tu código de acceso a tu neuropsicólogo</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando código...
                    </>
                  ) : (
                    'Acceder con Código'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Sistema inteligente - Deterioro cognitivo</p>
            <p className="text-xs mt-1">Versión 1.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
