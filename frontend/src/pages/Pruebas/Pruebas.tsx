import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Pruebas() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-blue-900">Pruebas disponibles</CardTitle>
          <CardDescription>Selecciona una prueba para comenzar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/mmse">
              <Button className="w-full" size="lg">MMSE</Button>
            </Link>
            <Link to="/cdt-test">
              <Button className="w-full" size="lg" variant="secondary">Prueba del reloj (CDT)</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

