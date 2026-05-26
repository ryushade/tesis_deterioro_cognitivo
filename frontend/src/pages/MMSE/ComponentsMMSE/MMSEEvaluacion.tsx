import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, AlertTriangle, Loader2, Clock } from "lucide-react";
import type { CategoriaMMSE, SeccionMMSE, OpcionMMSE, ItemMMSE } from "@/services/mmseEvaluacionService";
import { mmseEvaluacionService } from "@/services/mmseEvaluacionService";
import type { SeccionPayload, RespuestaItemPayload } from "@/services/mmseEvaluacionService";

interface ItemState {
  correcto: boolean | null;
  respuesta_texto: string;
  puntaje: 0 | 1;
}

interface SeccionState {
  id_eval_seccion: number | null;
  opcionSeleccionada: number;
  items: Record<number, ItemState>;
  guardada: boolean;
}

interface Props {
  categorias: CategoriaMMSE[];
  idEvaluacion: number;
  onFinalizar: (tiempos?: Record<string, number>) => void;
  tiempoLimite?: number;
}


export default function MMSEEvaluacion({ categorias, idEvaluacion, onFinalizar, tiempoLimite }: Props) {
  // Flatten sections with category info
  const secciones: { seccion: SeccionMMSE; categoria: CategoriaMMSE; globalIndex: number }[] = [];
  categorias.forEach((cat) => {
    cat.secciones.forEach((sec) => {
      secciones.push({ seccion: sec, categoria: cat, globalIndex: secciones.length });
    });
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [seccionStates, setSeccionStates] = useState<Record<number, SeccionState>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time tracking states
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        const nextSec = prev + 1;
        
        // If there's a limit and we've reached it, auto-finalize the test!
        if (tiempoLimite && nextSec >= tiempoLimite) {
          clearInterval(intervalRef.current!);
          setTimeout(() => {
            const tiempos = {
              total: prev
            };
            onFinalizar(tiempos);
          }, 0);
        }

        return nextSec;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tiempoLimite]);


  const remainingSeconds = tiempoLimite ? tiempoLimite - elapsedSeconds : null;
  const isTimeCritical = remainingSeconds !== null && remainingSeconds <= 60;
  const displaySeconds = tiempoLimite ? Math.max(0, tiempoLimite - elapsedSeconds) : elapsedSeconds;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const current = secciones[currentIdx];

  useEffect(() => {
    if (current && current.categoria) {
      // Tracking total time natively now
    }
  }, [current]);

  if (!current) return null;

  const { seccion, categoria } = current;
  const defaultOpcion = seccion.opciones.find(o => o.es_default) || seccion.opciones[0];

  const getState = useCallback((secId: number): SeccionState => {
    if (seccionStates[secId]) return seccionStates[secId];
    const defOpc = secciones.find(s => s.seccion.id_seccion === secId)?.seccion.opciones.find(o => o.es_default)
      || secciones.find(s => s.seccion.id_seccion === secId)?.seccion.opciones[0];
    return {
      id_eval_seccion: null,
      opcionSeleccionada: defOpc?.id_opcion || 0,
      items: {},
      guardada: false,
    };
  }, [seccionStates, secciones]);

  const state = getState(seccion.id_seccion);
  const opcionActiva = seccion.opciones.find(o => o.id_opcion === state.opcionSeleccionada) || defaultOpcion;

  const updateState = (secId: number, patch: Partial<SeccionState>) => {
    setSeccionStates(prev => ({
      ...prev,
      [secId]: { ...getState(secId), ...patch }
    }));
  };

  const setItemState = (itemId: number, patch: Partial<ItemState>) => {
    const prev = state.items[itemId] || { correcto: null, respuesta_texto: "", puntaje: 0 as const };
    const updated = { ...prev, ...patch };
    if (patch.correcto === true) updated.puntaje = 1;
    else if (patch.correcto === false) updated.puntaje = 0;
    updateState(seccion.id_seccion, {
      items: { ...state.items, [itemId]: updated }
    });
  };

  const selectOpcion = (opcId: number) => {
    updateState(seccion.id_seccion, { opcionSeleccionada: opcId, items: {}, guardada: false, id_eval_seccion: null });
  };

  // Calculate scores
  const getPuntajeCategoria = (cat: CategoriaMMSE): number => {
    let total = 0;
    cat.secciones.forEach(sec => {
      const s = getState(sec.id_seccion);
      const opc = sec.opciones.find(o => o.id_opcion === s.opcionSeleccionada) || sec.opciones[0];
      opc?.items.forEach(item => {
        total += (s.items[item.id_item]?.puntaje || 0);
      });
    });
    return total;
  };

  const getPuntajeTotal = (): number => categorias.reduce((sum, cat) => sum + getPuntajeCategoria(cat), 0);

  const guardarSeccionActual = async (): Promise<number | null> => {
    setSaving(true);
    setError(null);
    try {
      // 1. Save section
      const secPayload: SeccionPayload = {
        id_evaluacion: idEvaluacion,
        id_seccion: seccion.id_seccion,
        id_opcion_aplicada: state.opcionSeleccionada || opcionActiva.id_opcion,
        orden_aplicacion: currentIdx + 1,
        aplicada: true,
        omitida: false,
      };
      const secRes = await mmseEvaluacionService.guardarSeccion(secPayload);
      if (!secRes.success || !secRes.data) {
        setError(secRes.message || "Error guardando sección");
        return null;
      }
      const idEvalSeccion = secRes.data.id_eval_seccion;

      // 2. Save item responses
      for (const item of opcionActiva.items) {
        const itemState = state.items[item.id_item];
        if (itemState && itemState.correcto !== null) {
          const respPayload: RespuestaItemPayload = {
            id_eval_seccion: idEvalSeccion,
            id_opcion: opcionActiva.id_opcion,
            id_item: item.id_item,
            respuesta_texto: itemState.respuesta_texto || undefined,
            correcto: itemState.correcto,
            puntaje: itemState.puntaje,
          };
          const respRes = await mmseEvaluacionService.guardarRespuesta(respPayload);
          if (!respRes.success) {
            setError(respRes.message || `Error guardando ítem ${item.id_item}`);
            return null;
          }
        }
      }

      updateState(seccion.id_seccion, { id_eval_seccion: idEvalSeccion, guardada: true });
      return idEvalSeccion;
    } catch (e: any) {
      setError(e.message || "Error de conexión");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const res = await guardarSeccionActual();
    if (res !== null && currentIdx < secciones.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleFinish = async () => {
    const res = await guardarSeccionActual();
    if (res !== null) {
      const tiempos = {
        total: elapsedSeconds
      };
      onFinalizar(tiempos);
    }
  };

  const isLastSection = currentIdx === secciones.length - 1;
  const progress = ((currentIdx + 1) / secciones.length) * 100;

  // Styles
  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)',
    borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 8px 32px rgba(31,38,135,0.1)', padding: '1.5rem',
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', width: '100%', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ ...card, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Categorías
          </h3>
          {categorias.map(cat => {
            const score = getPuntajeCategoria(cat);
            const isActive = cat.id_categoria === categoria.id_categoria;
            return (
              <div key={cat.id_categoria} style={{
                padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '0.5rem',
                background: isActive ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : '#f8fafc',
                border: isActive ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#1e40af' : '#475569' }}>
                    {cat.nombre_categoria}
                  </span>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                    background: score > 0 ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#e2e8f0',
                    color: score > 0 ? '#fff' : '#94a3b8',
                  }}>
                    {score}/{cat.puntaje_maximo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ ...card, padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Puntaje total</p>
          <p style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {getPuntajeTotal()}/30
          </p>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Progress bar */}
        <div style={{ ...card, padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
              Sección {currentIdx + 1} de {secciones.length}
            </span>
            <span style={{
              fontFamily: 'monospace', fontSize: '0.85rem', 
              fontWeight: isTimeCritical ? 900 : 700,
              color: isTimeCritical ? '#ffffff' : '#475569', 
              background: isTimeCritical ? '#ef4444' : '#f1f5f9', 
              padding: '2px 8px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', gap: '4px', 
              border: isTimeCritical ? '1px solid #ef4444' : '1px solid #e2e8f0',
              animation: isTimeCritical ? 'pulseRed 1s infinite' : 'none',
              transform: isTimeCritical ? 'scale(1.05)' : 'none',
              transition: 'all 0.3s ease',
            }}>
              <Clock size={12} style={{ color: isTimeCritical ? '#ffffff' : '#6366f1' }} />
              {formatTime(displaySeconds)}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3b82f6' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '3px', width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Category & Section header */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em',
              color: '#3b82f6', background: '#eff6ff', padding: '3px 10px', borderRadius: '999px',
            }}>
              {categoria.nombre_categoria}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
            {seccion.nombre_seccion}
          </h2>
          {seccion.instrucciones_aplicacion && (
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              {seccion.instrucciones_aplicacion}
            </p>
          )}
        </div>

        {/* Option selector (for sections with multiple options) */}
        {seccion.permite_opciones && seccion.opciones.length > 1 && (
          <div style={card}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>
              <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px', color: '#f59e0b' }} />
              Seleccione la opción a aplicar (solo una contará para el puntaje):
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {seccion.opciones.map(opc => (
                <button key={opc.id_opcion} onClick={() => selectOpcion(opc.id_opcion)} style={{
                  padding: '0.75rem 1.25rem', borderRadius: '0.75rem', cursor: 'pointer',
                  border: state.opcionSeleccionada === opc.id_opcion ? '2px solid #3b82f6' : '1.5px solid #e2e8f0',
                  background: state.opcionSeleccionada === opc.id_opcion ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : '#fff',
                  color: state.opcionSeleccionada === opc.id_opcion ? '#1e40af' : '#475569',
                  fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s ease',
                }}>
                  {opc.nombre_opcion}
                </button>
              ))}
            </div>
            {opcionActiva.instrucciones && (
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem', fontStyle: 'italic' }}>
                {opcionActiva.instrucciones}
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {opcionActiva.items.map((item, idx) => {
            const itemState = state.items[item.id_item] || { correcto: null, respuesta_texto: "", puntaje: 0 };
            return (
              <div key={item.id_item} style={{
                ...card,
                border: itemState.correcto === true ? '1.5px solid #22c55e' : itemState.correcto === false ? '1.5px solid #ef4444' : '1px solid rgba(255,255,255,0.5)',
                transition: 'all 0.25s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                        {item.texto_item}
                      </span>
                    </div>
                    {item.criterio_correccion && (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '2rem' }}>
                        Criterio: {item.criterio_correccion}
                      </p>
                    )}
                    {item.respuesta_esperada && (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '2rem', fontStyle: 'italic' }}>
                        Resp. esperada: {item.respuesta_esperada}
                      </p>
                    )}
                    {/* Text response field */}
                    {['texto', 'verbal', 'numero', 'escritura'].includes(item.tipo_respuesta) && (
                      <input
                        type="text"
                        placeholder="Respuesta del paciente..."
                        value={itemState.respuesta_texto}
                        onChange={(e) => setItemState(item.id_item, { respuesta_texto: e.target.value })}
                        style={{
                          marginTop: '0.5rem', marginLeft: '2rem', width: 'calc(100% - 2rem)',
                          padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
                          fontSize: '0.9rem', outline: 'none', background: '#f8fafc',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    )}
                  </div>

                  {/* Correct/Incorrect buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button onClick={() => setItemState(item.id_item, { correcto: true })} style={{
                      width: '44px', height: '44px', borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
                      background: itemState.correcto === true ? '#22c55e' : '#f0fdf4',
                      color: itemState.correcto === true ? '#fff' : '#22c55e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease', boxShadow: itemState.correcto === true ? '0 2px 8px rgba(34,197,94,0.3)' : 'none',
                    }}>
                      <CheckCircle2 size={22} />
                    </button>
                    <button onClick={() => setItemState(item.id_item, { correcto: false })} style={{
                      width: '44px', height: '44px', borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
                      background: itemState.correcto === false ? '#ef4444' : '#fef2f2',
                      color: itemState.correcto === false ? '#fff' : '#ef4444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease', boxShadow: itemState.correcto === false ? '0 2px 8px rgba(239,68,68,0.3)' : 'none',
                    }}>
                      <XCircle size={22} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem' }}>
          <button onClick={handlePrev} disabled={currentIdx === 0 || saving} style={{
            padding: '0.875rem 1.5rem', borderRadius: '0.875rem', border: '1.5px solid #e2e8f0',
            background: '#fff', color: '#475569', fontSize: '0.95rem', fontWeight: 600, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentIdx === 0 ? 0.5 : 1, transition: 'all 0.2s ease',
          }}>
            <ChevronLeft size={18} /> Anterior
          </button>

          {isLastSection ? (
            <button onClick={handleFinish} disabled={saving} style={{
              padding: '0.875rem 2rem', borderRadius: '0.875rem', border: 'none',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
              fontSize: '0.95rem', fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(34,197,94,0.35)', transition: 'all 0.2s ease',
            }}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {saving ? 'Guardando...' : 'Finalizar Evaluación'}
            </button>
          ) : (
            <button onClick={handleNext} disabled={saving} style={{
              padding: '0.875rem 2rem', borderRadius: '0.875rem', border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff',
              fontSize: '0.95rem', fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(59,130,246,0.35)', transition: 'all 0.2s ease',
            }}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {saving ? 'Guardando...' : 'Siguiente'}
              {!saving && <ChevronRight size={18} />}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseRed {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.0); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
