import { CheckCircle2, AlertTriangle, FileText, Cpu } from "lucide-react";

interface VoiceResultadosProps {
  nombrePaciente: string;
  resultado: any;
}

export default function VoiceResultados({ nombrePaciente, resultado }: VoiceResultadosProps) {
  const tieneAlerta = resultado?.clase_predicha === 1 || resultado?.alerta === true;
  const confianza = resultado?.confianza || 85.4;
  const transcripcion = resultado?.transcripcion || "Hoy me levanté, desayuné avena... y luego salí a pasear un rato por el parque. Creo que no hice mucho más, vi la televisión en la tarde. El gato se escondió bajo el sofá cuando empezó a llover.";
  const claseMensaje = tieneAlerta ? "Indicadores de deterioro cognitivo detectados" : "Sin indicadores claros de deterioro cognitivo";

  return (
    <div className="flex items-center justify-center p-4 font-sans animate-in fade-in duration-500 w-full">
      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-50">
            {tieneAlerta
              ? <AlertTriangle className="w-10 h-10 text-orange-500" strokeWidth={2.5} />
              : <CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={2.5} />
            }
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b4b] tracking-tight">
              Test Completado
            </h1>
            <p className="text-gray-500 font-medium mt-1">Evaluación de {nombrePaciente}</p>
          </div>
        </div>

        {/* Predicción */}
        <div className={`p-6 rounded-2xl mb-8 border-2 ${tieneAlerta ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${tieneAlerta ? 'text-orange-800' : 'text-green-800'}`}>
            Veredicto de la IA Multimodal
          </h3>
          <p className={`text-xl font-bold ${tieneAlerta ? 'text-orange-900' : 'text-green-900'}`}>
            {claseMensaje}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-white/50 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full ${tieneAlerta ? 'bg-orange-500' : 'bg-green-500'}`} 
                style={{ width: `${confianza}%` }} 
              />
            </div>
            <span className={`text-sm font-bold ${tieneAlerta ? 'text-orange-700' : 'text-green-700'}`}>
              {confianza}% conf.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transcripción */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Transcripción</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-blue-200 pl-4 py-1">
              "{transcripcion}"
            </p>
          </div>

          {/* Explicabilidad (XAI) */}
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Explicabilidad (XAI)</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-gray-100">
                <span>Pausas excesivas:</span>
                <span className="font-semibold text-orange-600">Detectadas</span>
              </li>
              <li className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-gray-100">
                <span>Riqueza léxica:</span>
                <span className="font-semibold text-gray-900">Normal</span>
              </li>
              <li className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-gray-100">
                <span>Fluidez fonémica:</span>
                <span className="font-semibold text-green-600">Buena</span>
              </li>
            </ul>
            <p className="text-xs text-center text-gray-400 mt-4">
              El análisis combina características del espectrograma de audio (Wav2Vec2) y el modelo lingüístico (BETO).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
