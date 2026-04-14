import { CheckCircle2, Brain, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ResultadosCDT({ nombrePaciente, resultado }: { nombrePaciente: string; resultado: any }) {
  const navigate = useNavigate();
  const puntaje = resultado?.puntuacion || 8;
  const puntajeMax = 10;
  const porcentaje = (puntaje / puntajeMax) * 100;

  const handleFinalizar = () => {
    // Limpiar sesión del paciente y volver al login
    ["isAuthenticated","user","authToken","userType","nombrePaciente","accessCode","tipoEvaluacion","idCodigo"].forEach(k => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center justify-center p-4 font-sans animate-in fade-in duration-500 w-full">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">

        {/* Success Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-1">
            <CheckCircle2 className="w-8 h-8 text-green-500" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b4b]">
              ¡Prueba completada!
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Prueba del Reloj — {nombrePaciente}
            </p>
          </div>
        </div>

        {/* Results Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-[#1a2b4b]">Resultado del análisis</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-slate-500 font-medium text-sm">Puntuación</span>
              <span className="text-2xl font-bold text-[#1a2b4b]">{puntaje}/{puntajeMax}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#3b5bdb] h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${porcentaje}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <span className="text-slate-500 font-medium text-sm">Clasificación</span>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-bold px-3 py-1">
              {resultado?.clasificacion || "Normal"}
            </Badge>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-slate-500 font-medium text-[13px]">Observaciones de la IA</span>
            <p className="text-[#1a2b4b] leading-relaxed text-[15px]">
              {resultado?.observaciones || "Círculo bien definido, números correctamente ubicados. Manecillas apuntan correctamente a las 11:10."}
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 bg-slate-50 text-slate-500 text-[13px] sm:text-sm text-center p-4 rounded-xl font-medium leading-relaxed border border-slate-100">
          Este resultado ha sido registrado automáticamente. Tu neuropsicólogo podrá revisarlo en su panel.
        </div>

        {/* Exit */}
        <div className="mt-6">
          <Button
            onClick={handleFinalizar}
            variant="outline"
            className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl py-6 text-base font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Finalizar y cerrar sesión
          </Button>
        </div>

      </div>
    </div>
  );
}
