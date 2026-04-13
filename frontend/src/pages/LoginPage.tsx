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
      console.error('Error en login:', error);
      setError('Error de conexion con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Reconstruir el código para que coincida con DB (AAA-BBBB) y en mayúsculas
    let formattedCode = accessCode.toUpperCase();
    if (formattedCode.length === 7 && !formattedCode.includes("-")) {
      formattedCode = `${formattedCode.slice(0, 3)}-${formattedCode.slice(3)}`;
    }

    try {
      const response = await authService.patientLogin({ access_code: formattedCode });
      if (response.success) {
        window.dispatchEvent(new CustomEvent("loginSuccess"));
        
        // El backend ahora devuelve la información del código en response.codigo_info
        let target = "/pruebas";
        
        if (response.codigo_info) {
          const { codigo, tipo_evaluacion, id_codigo } = response.codigo_info;
          localStorage.setItem("accessCode", codigo);
          localStorage.setItem("tipoEvaluacion", tipo_evaluacion);
          localStorage.setItem("idCodigo", String(id_codigo));
          
          switch ((tipo_evaluacion || "").toUpperCase()) {
            case "CDT":
              target = `/evaluaciones/cdt/${id_codigo}`;
              break;
            case "MMSE":
              target = `/evaluaciones/mmse/${id_codigo}`;
              break;
            default:
              target = "/pruebas";
              break;
          }
        }
        
        navigate(target, { replace: true });
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      console.error('Error en login de paciente:', error);
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
        
          <CardTitle className="text-3xl font-black text-center tracking-tight mt-4">
            SISTEMA INTELIGENTE DETERIORO COGNITIVO
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
                  maxLength={7}
                  value={accessCode}
                  onChange={setAccessCode}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  containerClassName="justify-center"
                  
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
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
            <p className="text-xs mt-1">Version 1.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
