import { useState, useEffect } from "react";
import { 
  MapPin, ArrowRight, ArrowLeft, Globe, Map, Home, Layers, 
  Calendar, Clock, Sun, Sparkles, CheckCircle2, AlertTriangle 
} from "lucide-react";

export interface OrientacionEspacialData {
  // Temporal
  anio: string;
  diaMes: string;
  mes: string;
  diaSemana: string;
  estacion: string;
  // Espacial
  pais: string;
  departamento: string;
  ciudad: string;
  lugar: string;
  piso: string;
}

interface Props {
  nombrePaciente: string;
  onContinuar: (data: OrientacionEspacialData) => void;
  onVolver: () => void;
}

const monthsList = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const daysOfWeekList = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
];

const seasonsList = ["Primavera", "Verano", "Otoño", "Invierno"];

const obtenerEstacionPeru = (date: Date): string => {
  const month = date.getMonth(); // 0 = Enero, 11 = Diciembre
  const day = date.getDate();
  
  if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day <= 20)) {
    return "Verano";
  }
  if ((month === 2 && day >= 21) || month === 3 || month === 4 || (month === 5 && day <= 20)) {
    return "Otoño";
  }
  if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day <= 22)) {
    return "Invierno";
  }
  return "Primavera"; // 23 de septiembre al 20 de diciembre
};

export default function MMSEOrientacionEspacialSetup({ nombrePaciente, onContinuar, onVolver }: Props) {
  const [activeTab, setActiveTab] = useState<"temporal" | "espacial">("temporal");
  const [data, setData] = useState<OrientacionEspacialData>({
    anio: "",
    diaMes: "",
    mes: "",
    diaSemana: "",
    estacion: "",
    pais: "Perú", // Default common country
    departamento: "",
    ciudad: "",
    lugar: "",
    piso: "",
  });

  const handleInputChange = (field: keyof OrientacionEspacialData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const isTemporalValid = 
    data.anio.trim().length >= 4 && 
    data.diaMes.trim().length >= 1 && 
    data.mes !== "" && 
    data.diaSemana !== "" && 
    data.estacion !== "";

  const isEspacialValid = 
    data.pais.trim().length >= 2 && 
    data.departamento.trim().length >= 2 && 
    data.ciudad.trim().length >= 2 && 
    data.lugar.trim().length >= 2 && 
    data.piso.trim().length >= 2;

  const handleNext = () => {
    if (activeTab === "temporal" && isTemporalValid) {
      // Validar si los datos temporales ingresados coinciden con los del PC y la estación en Perú
      const now = new Date();
      const currentYear = now.getFullYear().toString();
      const currentDiaMes = now.getDate().toString();
      const currentMes = monthsList[now.getMonth()];
      const currentDiaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][now.getDay()];
      const currentSeason = obtenerEstacionPeru(now);

      const hasMismatch =
        data.anio.trim() !== currentYear ||
        data.diaMes.trim() !== currentDiaMes ||
        data.mes !== currentMes ||
        data.diaSemana !== currentDiaSemana ||
        data.estacion !== currentSeason;

      if (hasMismatch) {
        const proceed = window.confirm(
          "Atención: Los datos temporales configurados no coinciden exactamente con la fecha y día actuales de su PC. ¿Desea continuar con esta configuración?"
        );
        if (!proceed) return;
      }

      setActiveTab("espacial");
    } else if (activeTab === "espacial" && isTemporalValid && isEspacialValid) {
      onContinuar(data);
    }
  };

  const handleBack = () => {
    if (activeTab === "espacial") {
      setActiveTab("temporal");
    } else {
      onVolver();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10 relative">
        {/* Decorative Top Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
            Orientación temporal y espacial
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Configure las respuestas correctas para la evaluación cognitiva de <span className="text-indigo-650 font-bold">{nombrePaciente}</span>.
          </p>
        </div>

        {/* Tab Navigation/Status Bar */}
        <div className="flex gap-4 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab("temporal")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "temporal"
                ? "bg-white text-indigo-700 shadow-md shadow-slate-200"
                : "text-slate-550 hover:bg-white/40 hover:text-slate-700"
            }`}
          >
            <Calendar className="w-4 h-4" />
            1. Temporal (Fecha y Día)
            {isTemporalValid && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-0.5" />}
          </button>
          <button
            onClick={() => isTemporalValid && setActiveTab("espacial")}
            disabled={!isTemporalValid}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === "espacial"
                ? "bg-white text-indigo-700 shadow-md shadow-slate-200"
                : "text-slate-550 hover:bg-white/40 hover:text-slate-700"
            }`}
          >
            <MapPin className="w-4 h-4" />
            2. Espacial (Ubicación)
            {isEspacialValid && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-0.5" />}
          </button>
        </div>

        {/* Tab Content 1: Temporal */}
        {activeTab === "temporal" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-450 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-indigo-500" />
              Datos de Tiempo Actuales (Verifique y edite)
            </h3>

            {(() => {
              const now = new Date();
              const currentYear = now.getFullYear().toString();
              const currentDiaMes = now.getDate().toString();
              const currentMes = monthsList[now.getMonth()];
              const currentDiaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][now.getDay()];
              const currentSeason = obtenerEstacionPeru(now);

              const hasMismatch =
                (data.anio && data.anio.trim() !== currentYear) ||
                (data.diaMes && data.diaMes.trim() !== currentDiaMes) ||
                (data.mes && data.mes !== currentMes) ||
                (data.diaSemana && data.diaSemana !== currentDiaSemana) ||
                (data.estacion && data.estacion !== currentSeason);

              if (hasMismatch) {
                return (
                  <div className="bg-amber-50 border border-amber-200/80 text-amber-900 rounded-2xl p-4 flex gap-3 text-xs font-semibold animate-in fade-in duration-300">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                    <div className="text-left leading-relaxed">
                      <p className="font-bold">Advertencia de Mismatch:</p>
                      <p className="mt-0.5 text-amber-800">
                        Los datos configurados no coinciden exactamente con la fecha y día actuales de la PC. Verifique si el reloj de su computadora está correcto o si desea evaluar un día distinto.
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Año */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Año de la Evaluación</label>
                <input
                  type="number"
                  placeholder="Ej. 2026"
                  value={data.anio}
                  onChange={(e) => handleInputChange("anio", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all shadow-sm"
                />
              </div>

              {/* Día del Mes */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Día del Mes (Número)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ej. 26"
                  value={data.diaMes}
                  onChange={(e) => handleInputChange("diaMes", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all shadow-sm"
                />
              </div>

              {/* Mes */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Mes</label>
                <select
                  value={data.mes}
                  onChange={(e) => handleInputChange("mes", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all shadow-sm"
                >
                  <option value="">Seleccione el mes...</option>
                  {monthsList.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Día de la Semana */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Día de la Semana</label>
                <select
                  value={data.diaSemana}
                  onChange={(e) => handleInputChange("diaSemana", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all shadow-sm"
                >
                  <option value="">Seleccione el día...</option>
                  {daysOfWeekList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Estación */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600">Estación del Año</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {seasonsList.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleInputChange("estacion", s)}
                      className={`py-3.5 px-4 rounded-xl border font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                        data.estacion === s
                          ? "bg-gradient-to-r from-indigo-650 to-blue-600 text-white border-indigo-600 shadow-md shadow-indigo-500/15"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Espacial */}
        {activeTab === "espacial" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-450 flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-indigo-500" />
              Datos de ubicación física
            </h3>

            <div className="space-y-5">
              {/* País */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">País</label>
                <input
                  type="text"
                  disabled
                  value={data.pais}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed shadow-sm"
                />
              </div>

              {/* Departamento / Estado */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Departamento, provincia o estado</label>
                <input
                  type="text"
                  placeholder="Escriba el departamento (ej. Lambayeque)"
                  value={data.departamento}
                  onChange={(e) => handleInputChange("departamento", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all shadow-sm"
                />
              </div>

              {/* Ciudad */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Ciudad o distrito</label>
                <input
                  type="text"
                  placeholder="Escriba la ciudad (ej. Chiclayo)"
                  value={data.ciudad}
                  onChange={(e) => handleInputChange("ciudad", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all shadow-sm"
                />
              </div>

              {/* Establecimiento / Lugar */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Establecimiento o lugar</label>
                <input
                  type="text"
                  placeholder="Escriba el establecimiento (ej. Casa, hospital)"
                  value={data.lugar}
                  onChange={(e) => handleInputChange("lugar", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all shadow-sm"
                />
              </div>

              {/* Piso / Sala */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Piso, sala o área</label>
                <input
                  type="text"
                  placeholder="Escriba el piso (ej. 1er piso, sala de estar)"
                  value={data.piso}
                  onChange={(e) => handleInputChange("piso", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-10 flex justify-between gap-4">
          <button
            onClick={handleBack}
            className="px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 active:scale-95 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft size={16} />
            {activeTab === "temporal" ? "Atrás" : "Anterior"}
          </button>

          {activeTab === "temporal" ? (
            <button
              onClick={handleNext}
              disabled={!isTemporalValid}
              className="px-8 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-650/25 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isTemporalValid || !isEspacialValid}
              className="px-8 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-650/25 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              Iniciar evaluación 
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
