import { Mic, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VoiceInstrucciones({ nombrePaciente, onNext, onBack }: { nombrePaciente: string; onNext: () => void; onBack?: () => void }) {
  return (
    <div className="flex items-center justify-center p-4 font-sans animate-in fade-in duration-500 w-full">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
        
        {/* Header */}
        <div className="flex items-center gap-5 border-b pb-6 border-gray-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b4b] tracking-tight">
              Test de Fluidez Verbal (Voz)
            </h1>
            <p className="text-gray-500 font-medium mt-1 text-sm sm:text-base">
              Paciente: {nombrePaciente}
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-8 space-y-6">
          <h2 className="text-sm font-bold tracking-[0.15em] text-[#1a2b4b] uppercase">
            Instrucciones Generales
          </h2>
          
          <ul className="space-y-5">
            {[
              "Busque un lugar tranquilo y silencioso sin ruidos de fondo.",
              "Hablará frente al dispositivo para responder a 5 preguntas.",
              "Al ver cada pregunta, presione el micrófono para comenzar.",
              "Hable de forma natural, a un volumen normal y con claridad.",
              "Se le pedirán permisos para utilizar el micrófono de su navegador."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4 group">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-sm transition-colors group-hover:bg-blue-100">
                  {i + 1}
                </div>
                <p className="text-gray-700 leading-relaxed text-[15px] sm:text-[16px] font-medium pt-1">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Advertencia Permisos */}
        <div className="mt-8 bg-[#f5fbff] border border-blue-200/50 rounded-2xl p-5 flex gap-3 items-start">
          <Mic className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <p className="text-blue-800 text-sm sm:text-[15px] font-medium leading-relaxed">
            Deberá otorgar permisos de micrófono en la siguiente pantalla. Asegúrese de que el micrófono de su computadora o celular funcione correctamente.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {onBack && (
            <Button 
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-1/3 py-7 text-lg font-semibold rounded-2xl border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300 transition-colors"
            >
              Retroceder
            </Button>
          )}
          <Button 
            onClick={onNext}
            className={`w-full ${onBack ? 'sm:w-2/3' : ''} bg-[#3b5bdb] hover:bg-[#324fbe] text-white rounded-2xl py-7 text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:translate-y-[-2px]`}
          >
            Comenzar Prueba
          </Button>
        </div>

      </div>
    </div>
  );
}
