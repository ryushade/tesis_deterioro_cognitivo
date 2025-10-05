import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PruebaFinalizada() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-emerald-700">¡Gracias!</CardTitle>
          <CardDescription>Has completado la prueba.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Puedes cerrar esta ventana o regresar al listado de pruebas.</p>
            <Link to="/pruebas">
              <Button>Volver a pruebas</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

