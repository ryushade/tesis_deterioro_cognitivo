import { CheckCircle2, AlertTriangle, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Colores clínicos según nivel de puntaje (escala 0-5, Shulman et al., 1986)
function getColorPuntaje(puntaje: number) {
  if (puntaje >= 4) return { bar: "bg-green-500", text: "text-green-700", bg: "bg-green-100" };
  if (puntaje === 3) return { bar: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-100" };
  if (puntaje === 2) return { bar: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-100" };
  return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-100" };
}

export default function ResultadosCDT({ nombrePaciente, resultado }: { nombrePaciente: string; resultado: any }) {
  const navigate = useNavigate();
  const puntaje = resultado?.puntuacion ?? 0;
  const puntajeMax = resultado?.puntaje_max ?? 5;
  const porcentaje = Math.round((puntaje / puntajeMax) * 100);
  const conAlerta = resultado?.alerta ?? puntaje < 4;
  const colores = getColorPuntaje(puntaje);

  const handleFinalizar = () => {
    ["isAuthenticated","user","authToken","userType","nombrePaciente","accessCode","tipoEvaluacion","idCodigo"].forEach(k => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center justify-center p-4 font-sans animate-in fade-in duration-500 w-full">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${conAlerta ? 'bg-orange-50' : 'bg-green-50'}`}>
            {conAlerta
              ? <AlertTriangle className="w-8 h-8 text-orange-500" strokeWidth={2.5} />
              : <CheckCircle2 className="w-8 h-8 text-green-500" strokeWidth={2.5} />
            }
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b4b]">
              {conAlerta ? "Evaluación completada - Requiere revisión" : "Evaluación completada"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Prueba del reloj - {nombrePaciente}
            </p>
          </div>
        </div>

        {/* Score box */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 space-y-5">

          {/* Puntaje */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Puntaje Obtenido
              </p>
              <p className="text-4xl font-black text-[#1a2b4b]">
                {puntaje}
                <span className="text-xl font-medium text-slate-400">/{puntajeMax}</span>
              </p>
            </div>
            <Badge className={`${colores.bg} ${colores.text} border-0 font-bold px-4 py-1.5 text-sm`}>
              {resultado?.clasificacion || "Sin clasificar"}
            </Badge>
          </div>

          {/* Barra de progreso */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Deterioro cognitivo grave</span>
              <span>Normal</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`${colores.bar} h-3 rounded-full transition-all duration-700`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            {/* Escala de referencia */}
            <div className="flex justify-between text-[10px] text-slate-300 mt-1 px-0.5">
              {[0,1,2,3,4,5].map(n => (
                <span key={n} className={n === puntaje ? `${colores.text} font-bold text-xs` : ''}>{n}</span>
              ))}
            </div>
          </div>

          {/* Observaciones clínicas */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Observaciones clínicas
              </span>
              {conAlerta && (
                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                  ⚠ Requiere atención
                </span>
              )}
            </div>
            <p className="text-[#1a2b4b] leading-relaxed text-[14px] sm:text-[15px]">
              {resultado?.observaciones || "Sin observaciones disponibles."}
            </p>
          </div>
        </div>

        {/* Metodología */}
        <div className="mt-5 bg-slate-50 text-slate-400 text-[12px] text-center p-3 rounded-xl border border-slate-100">
          Evaluación automática basada en criterios NHATS. 
          El resultado ha sido registrado y está disponible para el neuropsicólogo.
        </div>

        {/* Botón salida */}
        <div className="mt-5">
          <Button
            onClick={handleFinalizar}
            variant="outline"
            className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl py-6 text-base font-semibold flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Finalizar y cerrar sesión
          </Button>
        </div>

      </div>
    </div>
  );
}
