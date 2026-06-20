import { Trophy, TrendingUp, CheckCircle, AlertTriangle, XCircle, LogOut } from "lucide-react";
import type { ResultadoCategoria } from "@/services/mmseEvaluacionService";
import { useNavigate } from "react-router-dom";

interface Props {
  puntajeTotal: number;
  categorias: ResultadoCategoria[];
  nombrePaciente: string;
  tiempos?: Record<string, number>;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getClasificacion(puntaje: number) {
  if (puntaje >= 24) return { label: "Normal", color: "#22c55e", icon: <CheckCircle size={20} />, bg: "#f0fdf4" };
  if (puntaje >= 19) return { label: "Deterioro cognitivo leve", color: "#f59e0b", icon: <AlertTriangle size={20} />, bg: "#fffbeb" };
  if (puntaje >= 14) return { label: "Deterioro cognitivo moderado", color: "#f97316", icon: <AlertTriangle size={20} />, bg: "#fff7ed" };
  return { label: "Deterioro cognitivo severo", color: "#ef4444", icon: <XCircle size={20} />, bg: "#fef2f2" };
}

export default function MMSEResultados({ puntajeTotal, categorias, nombrePaciente, tiempos }: Props) {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const isPaciente = userType === "paciente";
  
  const clasificacion = getClasificacion(puntajeTotal);
  const porcentaje = Math.round((puntajeTotal / 30) * 100);

  // Sort categories clinically to match standard MMSE flow:
  // 1. Orientación (temporal / espacial)
  // 2. Fijación (Registro de palabras)
  // 3. Atención y cálculo (Restas seriadas)
  // 4. Memoria (Recuerdo diferido)
  // 5. Lenguaje y Praxis (Nombramiento, Repetición, 3 pasos, Lectura, Escritura, Dibujo)
  const getCategoryOrder = (cat: ResultadoCategoria): number => {
    const id = cat.id_categoria;
    const name = cat.nombre_categoria.toLowerCase();
    
    if (id === 1 || name.includes("orientac")) return 1;
    if (id === 5 || name.includes("fijac") || name.includes("registro")) return 2;
    if (id === 2 || name.includes("atenc") || name.includes("calculo")) return 3;
    if (id === 4 || name.includes("memor") || name.includes("recuerdo")) return 4;
    if (id === 3 || name.includes("lenguaje") || name.includes("praxis")) return 5;
    return 100;
  };

  const sortedCategorias = [...categorias].sort((a, b) => getCategoryOrder(a) - getCategoryOrder(b));

  const handleFinalizar = () => {
    ["isAuthenticated","user","authToken","userType","nombrePaciente","accessCode","tipoEvaluacion","idCodigo"].forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new Event('authStateChanged'));
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)',
        borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 8px 32px rgba(31,38,135,0.12)', padding: '2.5rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
         
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.25rem' }}>
            Evaluación finalizada
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '0.25rem' }}>
            Resultados de <strong>{nombrePaciente}</strong>
          </p>
          {tiempos && tiempos.total !== undefined && (
            <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 500 }}>
              ⏱ Tiempo de aplicación total: <strong style={{ color: '#4f46e5' }}>{formatDuration(tiempos.total)}</strong>
            </p>
          )}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: clasificacion.bg, padding: '0.5rem 1.25rem',
            borderRadius: '999px', color: clasificacion.color, fontWeight: 700, fontSize: '0.95rem', marginTop: '1rem',
          }}>
            {clasificacion.label}
          </div>
        </div>
      
        {/* Score circle */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '160px', height: '160px', borderRadius: '50%', margin: '0 auto 1rem',
            background: `conic-gradient(${clasificacion.color} ${porcentaje * 3.6}deg, #e2e8f0 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 24px ${clasificacion.color}30`,
          }}>
            <div style={{
              width: '130px', height: '130px', borderRadius: '50%', background: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: clasificacion.color }}>
                {puntajeTotal}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>/ 30</span>
            </div>
          </div>

          
        </div>

        {/* Categories table */}
        <div style={{
          background: '#f8fafc', borderRadius: '1rem', overflow: 'hidden',
          border: '1px solid #e2e8f0', marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 100px 100px',
            padding: '0.75rem 1.25rem', background: '#f1f5f9',
            fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Categoría</span>
            <span style={{ textAlign: 'center' }}>Obtenido</span>
            <span style={{ textAlign: 'center' }}>Máximo</span>
          </div>
          {sortedCategorias.map((cat) => {
            const pct = cat.puntaje_maximo > 0 ? (cat.puntaje_obtenido / cat.puntaje_maximo) * 100 : 0;
            return (
              <div key={cat.id_categoria} style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0',
                alignItems: 'center',
              }}>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                    {cat.nombre_categoria}
                  </span>
                  <div style={{
                    height: '4px', borderRadius: '2px', background: '#e2e8f0',
                    marginTop: '0.5rem', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '2px', width: `${pct}%`,
                      background: pct === 100 ? '#22c55e' : pct >= 50 ? '#3b82f6' : '#f59e0b',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
                <span style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>
                  {cat.puntaje_obtenido}
                </span>
                <span style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.9rem', color: '#94a3b8' }}>
                  {cat.puntaje_maximo}
                </span>
              </div>
            );
          })}
        </div>

        {/* Desglose de tiempos */}
        {tiempos && Object.keys(tiempos).length > 1 && (
          <div style={{
            background: '#f8fafc', borderRadius: '1rem', overflow: 'hidden',
            border: '1px solid #e2e8f0', marginBottom: '1.5rem', padding: '1.25rem'
          }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⏱ Desglose de Tiempos por Etapa
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { key: 'orientacion', label: 'Orientación (Temporal/Espacial)' },
                { key: 'fijacion', label: 'Fijación (Aprendizaje)' },
                { key: 'atencion', label: 'Atención y Cálculo' },
                { key: 'memoria', label: 'Memoria (Evocación)' },
                { key: 'lenguaje', label: 'Lenguaje y Construcción' }
              ].map(stage => {
                const secs = tiempos[stage.key] || 0;
                const total = tiempos.total || 1;
                const pct = Math.round((secs / total) * 100);
                return (
                  <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                      <span>{stage.label}</span>
                      <span>{formatDuration(secs)} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '4px', width: `${pct}%`,
                        background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{
          background: '#f0f9ff', borderRadius: '0.75rem', padding: '1rem 1.25rem',
          border: '1px solid #bae6fd', fontSize: '0.8rem', color: '#475569',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <strong>Interpretación de puntuación MMSE</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
            <span>• <strong style={{ color: '#22c55e' }}>24-30</strong>: Normal</span>
            <span>• <strong style={{ color: '#f59e0b' }}>19-23</strong>: Deterioro leve</span>
            <span>• <strong style={{ color: '#f97316' }}>14-18</strong>: Deterioro moderado</span>
            <span>• <strong style={{ color: '#ef4444' }}>≤13</strong>: Deterioro severo</span>
          </div>
        </div>
        
        {isPaciente && (
          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={handleFinalizar}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                transition: 'background 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
            >
              <LogOut size={16} /> Finalizar y cerrar sesión
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
