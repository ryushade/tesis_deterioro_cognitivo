import { Clock, AlertCircle, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstruccionesCDT({ nombrePaciente, onNext }: { nombrePaciente: string; onNext: () => void }) {
  return (
    <div className="flex items-center justify-center p-4 font-sans animate-in fade-in duration-500 w-full">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
        
        {/* Header */}
        <div className="flex items-center gap-5 border-b pb-6 border-gray-100">
          <div className="bg-blue-50/80 text-blue-600 p-4 rounded-2xl flex items-center justify-center">
            <Clock className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b4b] tracking-tight">
              Prueba del Reloj
            </h1>
            <p className="text-gray-500 font-medium mt-1 text-sm sm:text-base">
              Paciente: {nombrePaciente}
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-8 space-y-6">
          <h2 className="text-sm font-bold tracking-[0.15em] text-[#1a2b4b] uppercase">
            Instrucciones
          </h2>
          
          <ul className="space-y-5">
            {[
              "Toma una hoja de papel en blanco y un lápiz o bolígrafo.",
              "Dibuja un reloj circular con todos los números del 1 al 12 en su posición correcta.",
              "Dibuja las manecillas del reloj marcando las 11:10 (once y diez).",
              "Cuando termines, toma una foto clara del dibujo con tu celular."
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

        {/* Advertencia */}
        <div className="mt-8 bg-[#fff8ef] border border-amber-200/50 rounded-2xl p-5 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <p className="text-amber-700 text-sm sm:text-[15px] font-medium leading-relaxed">
            Asegúrate de que la foto sea nítida, bien iluminada y que se vea todo el dibujo completo.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-10">
          <Button 
            onClick={onNext}
            className="w-full bg-[#3b5bdb] hover:bg-[#324fbe] text-white rounded-2xl py-7 text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:translate-y-[-2px]"
          >
            <Camera className="w-5 h-5" />
            Continuar
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

      </div>
    </div>
  );
}
