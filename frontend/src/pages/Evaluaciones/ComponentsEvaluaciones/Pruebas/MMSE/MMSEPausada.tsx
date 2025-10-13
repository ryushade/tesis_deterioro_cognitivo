import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CheckCircle, Home, PlayCircle } from 'lucide-react'

export default function MMSEPausada() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">
            Sesión guardada exitosamente
          </h1>
          <p className="text-lg text-gray-600">
            Tu progreso en el MMSE ha sido guardado de forma segura.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-sm text-blue-900 font-medium">
            📋 Tu evaluación está pausada
          </p>
          <p className="text-sm text-gray-700">
            Puedes continuar en cualquier momento desde donde lo dejaste. 
            Tu progreso y respuestas han sido guardados.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate('/evaluaciones/mmse')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <PlayCircle className="w-5 h-5" />
            Continuar evaluación
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 Consejo: Puedes tomarte el tiempo que necesites. 
            Cuando regreses, tu evaluación continuará exactamente donde la dejaste.
          </p>
        </div>
      </div>
    </div>
  )
}

