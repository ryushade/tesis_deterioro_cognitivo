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
import { codigosAccesoService } from '@/services/codigosAccesoService';
import { MetaballsOriginal } from '@/pages/MeatBalls/MeatBalls';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';

export default function LoginPage() {
  const navigate = useNavigate();
  
  // Estados para neuropsicÃ³logo
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados para paciente
  const [accessCode, setAccessCode] = useState('');
  
  // Estados generales
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
        const message = response.message || '';
        let translatedMessage = 'No se pudo iniciar sesión.';

        if (message.includes('Invalid credentials')) {
          translatedMessage = message.includes('inactive role')
            ? 'Tu usuario estÃ¡ inactivo. Contacta a un administrador.'
            : 'Usuario o contraseña incorrectos.';
        } else if (message) {
          translatedMessage = message;
        }

        setError(translatedMessage);
      }
    } catch (error: any) {
      setError('Error de conexion con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await authService.patientLogin({ access_code: accessCode });
      if (response.success) {
        window.dispatchEvent(new CustomEvent("loginSuccess"));
        // Detectar prueba por código de acceso
        let target = "/pruebas";
        try {
          const res = await codigosAccesoService.getAll({ search: accessCode, limit: 1 });
          const match = (res.data || []).find((c: any) => (c.codigo || "").toUpperCase() === accessCode.toUpperCase());
          if (match) {
            localStorage.setItem("accessCode", match.codigo);
            localStorage.setItem("tipoEvaluacion", match.tipo_evaluacion);
            // Marcar el código como usado para que no quede en 'emitido'
            try {
              await codigosAccesoService.marcarComoUsado(match.codigo);
            } catch (markErr) {
              console.warn('No se pudo marcar el código como usado:', markErr);
            }
            switch ((match.tipo_evaluacion || "").toUpperCase()) {
              case "CDT":
                target = "/cdt-test";
                break;
              case "MMSE":
                target = "/mmse";
                break;
              default:
                target = "/pruebas";
                break;
            }
          }
        } catch (e) {
          // Si falló la búsqueda, intentar marcar igualmente con el código ingresado
          try { await codigosAccesoService.marcarComoUsado(accessCode); } catch {}
        }
        navigate(target, { replace: true });
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MetaballsOriginal />
      <div className="relative z-10 min-h-screen flex items-center justify-center bg-transparent p-4">
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
                Neuropsicologo
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
                      Iniciando sesion...
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </Button>
              </form>

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
                      Iniciando sesion...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Iniciar sesión
                    </>
                  )}
                </Button>
              </form>

            </TabsContent>
            
            <TabsContent value="paciente" className="space-y-4 mt-4">
              <form onSubmit={handlePatientLogin} className="space-y-4">
                <div className="space-y-2">
                    
                  <Label htmlFor="accessCode"
                  className='justify-center flex mb-4'
                  >Codigo de acceso</Label>
                  
                 <InputOTP
                  maxLength={8}
                  value={accessCode}
                  onChange={setAccessCode}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  containerClassName="justify-center"
                  
                >
                  <InputOTPGroup
                  >
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
                  </InputOTPGroup>
                </InputOTP>
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
                    'Acceder con código'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Sistema inteligente - Deterioro cognitivo</p>
            <p className="text-xs mt-1">VersiÃ³n 1.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
