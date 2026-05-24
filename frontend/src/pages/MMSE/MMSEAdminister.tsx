import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { mmseEvaluacionService } from "@/services/mmseEvaluacionService";
import type { EstructuraMMSE, AsignacionInfo, ResultadoFinal } from "@/services/mmseEvaluacionService";
import MMSEInstrucciones from "./ComponentsMMSE/MMSEInstrucciones";
import MMSEEvaluacion from "./ComponentsMMSE/MMSEEvaluacion";
import MMSEPacienteEvaluacion from "./ComponentsMMSE/MMSEPacienteEvaluacion";
import MMSEResultados from "./ComponentsMMSE/MMSEResultados";

type Step = "loading" | "instrucciones" | "evaluacion" | "finalizado" | "error";

export default function MMSEAdminister() {
  const { id_codigo } = useParams();
  const idAsignacion = Number(id_codigo);
  const userType = localStorage.getItem("userType");
  const isPaciente = userType === "paciente";

  const [step, setStep] = useState<Step>("loading");
  const [estructura, setEstructura] = useState<EstructuraMMSE | null>(null);
  const [asignacion, setAsignacion] = useState<AsignacionInfo | null>(null);
  const [idEvaluacion, setIdEvaluacion] = useState<number | null>(null);
  const [resultado, setResultado] = useState<ResultadoFinal | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [nombrePaciente, setNombrePaciente] = useState("Paciente");

  useEffect(() => {
    if (!idAsignacion || isNaN(idAsignacion)) {
      setErrorMsg("ID de asignación inválido");
      setStep("error");
      return;
    }

    const nombre = localStorage.getItem("nombrePaciente");
    if (nombre) setNombrePaciente(nombre);

    loadEstructura();
  }, []);

  const loadEstructura = async () => {
    setStep("loading");
    const res = await mmseEvaluacionService.obtenerEstructura(idAsignacion);
    if (!res.success || !res.estructura) {
      setErrorMsg(res.message || "Error al cargar estructura MMSE");
      setStep("error");
      return;
    }
    setEstructura(res.estructura);
    setAsignacion(res.asignacion || null);
    if (res.asignacion?.nombre_paciente) {
      setNombrePaciente(res.asignacion.nombre_paciente);
    }

    // If evaluation already finalized, show results
    if (res.evaluacion && res.evaluacion.estado_evaluacion === 2) {
      setIdEvaluacion(res.evaluacion.id_evaluacion);
      // Fetch final results
      const finRes = await mmseEvaluacionService.finalizarEvaluacion(res.evaluacion.id_evaluacion);
      if (finRes.success && finRes.data) {
        setResultado(finRes.data);
        setStep("finalizado");
      } else {
        setStep("instrucciones");
      }
      return;
    }

    setStep("instrucciones");
  };

  const handleIniciar = async () => {
    const res = await mmseEvaluacionService.iniciarEvaluacion(idAsignacion);
    if (!res.success || !res.data) {
      setErrorMsg(res.message || "Error al iniciar evaluación");
      setStep("error");
      return;
    }
    setIdEvaluacion(res.data.id_evaluacion);
    if (res.data.nombre_paciente) setNombrePaciente(res.data.nombre_paciente);
    setStep("evaluacion");
  };

  const handleFinalizar = async () => {
    if (!idEvaluacion) return;
    setStep("loading");
    const res = await mmseEvaluacionService.finalizarEvaluacion(idEvaluacion);
    if (!res.success || !res.data) {
      setErrorMsg(res.message || "Error al finalizar evaluación");
      setStep("error");
      return;
    }
    setResultado(res.data);
    setStep("finalizado");
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 50%, #dbeafe 100%)' }}>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        {step === "loading" && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <Loader2 size={48} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 600 }}>Cargando estructura MMSE...</p>
          </div>
        )}

        {step === "error" && (
          <div style={{
            maxWidth: '500px', width: '100%', textAlign: 'center',
            background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)',
            borderRadius: '1.5rem', padding: '2.5rem',
            border: '1px solid #fecaca', boxShadow: '0 8px 32px rgba(239,68,68,0.1)',
          }}>
            <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Error</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{errorMsg}</p>
            <button onClick={loadEstructura} style={{
              padding: '0.75rem 2rem', borderRadius: '0.75rem', border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff',
              fontWeight: 600, cursor: 'pointer',
            }}>
              Reintentar
            </button>
          </div>
        )}

        {step === "instrucciones" && estructura && (
          <MMSEInstrucciones
            nombrePaciente={nombrePaciente}
            nombrePrueba={estructura.nombre_prueba}
            puntajeMaximo={estructura.puntaje_maximo}
            totalCategorias={estructura.categorias.length}
            onIniciar={handleIniciar}
          />
        )}

        {step === "evaluacion" && estructura && idEvaluacion && (
          isPaciente ? (
            <MMSEPacienteEvaluacion
              categorias={estructura.categorias}
              idEvaluacion={idEvaluacion}
              onFinalizar={handleFinalizar}
            />
          ) : (
            <MMSEEvaluacion
              categorias={estructura.categorias}
              idEvaluacion={idEvaluacion}
              onFinalizar={handleFinalizar}
            />
          )
        )}

        {step === "finalizado" && resultado && (
          <MMSEResultados
            puntajeTotal={resultado.puntaje_total}
            categorias={resultado.categorias}
            nombrePaciente={nombrePaciente}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
