import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, AlertCircle, CheckCircle, Database } from 'lucide-react'

export default function MMSEConfiguracionPageDemo() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleTestBackend = async () => {
    try {
      setError(null)
      const response = await fetch('/api/mmse/configuracion/respuestas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        setError(`Error del backend (${response.status}): ${response.statusText}`)
        return
      }
      
      const data = await response.json()
      console.log('Backend response:', data)
      setSuccess('Backend funcionando correctamente')
      
    } catch (err) {
      console.error('Error testing backend:', err)
      setError(`Error de conexión: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Configuración MMSE</h1>
          <p className="text-gray-600">Gestiona las respuestas correctas para el test MMSE</p>
        </div>
        <Button onClick={handleTestBackend} className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Probar Backend
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardDescription>
            Verificación del estado de la configuración MMSE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Base de Datos</h3>
                <p className="text-sm text-gray-600">Tabla mmse_prueba_cognitiva_configuracion</p>
              </div>
              <div className="text-sm text-gray-500">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Pendiente</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Backend API</h3>
                <p className="text-sm text-gray-600">Endpoints /api/mmse/configuracion/*</p>
              </div>
              <div className="text-sm text-gray-500">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Pendiente</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Frontend</h3>
                <p className="text-sm text-gray-600">Componentes de configuración</p>
              </div>
              <div className="text-sm text-gray-500">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Listo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pasos para Completar la Configuración</CardTitle>
          <CardDescription>
            Sigue estos pasos para activar completamente el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Ejecutar Script SQL</h3>
                <p className="text-sm text-gray-600">
                  Ejecuta el archivo <code>backend/database/mmse_configuracion.sql</code> en tu base de datos PostgreSQL
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Reiniciar Backend</h3>
                <p className="text-sm text-gray-600">
                  Reinicia el servidor backend para que reconozca las nuevas rutas y servicios
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Verificar Conexión</h3>
                <p className="text-sm text-gray-600">
                  Usa el botón "Probar Backend" arriba para verificar que la API esté funcionando
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">Usar Sistema</h3>
                <p className="text-sm text-gray-600">
                  Una vez que el backend esté funcionando, podrás gestionar las configuraciones MMSE
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
