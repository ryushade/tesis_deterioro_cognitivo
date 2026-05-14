import { Brain, ClipboardList, ArrowRight, Clock } from "lucide-react";

interface Props {
  nombrePaciente: string;
  nombrePrueba: string;
  puntajeMaximo: number;
  totalCategorias: number;
  onIniciar: () => void;
}

export default function MMSEInstrucciones({
  nombrePaciente,
  nombrePrueba,
  puntajeMaximo,
  totalCategorias,
  onIniciar
}: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fadeIn">
      <div
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 8px 32px rgba(31,38,135,0.12)',
          padding: '2.5rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
            }}
          >
            <Brain size={40} color="#fff" />
          </div>

          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 900,
              color: '#1e293b',
              marginBottom: '0.5rem',
              letterSpacing: '-0.025em',
            }}
          >
            {nombrePrueba}
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            Evaluación cognitiva para{' '}
            <span style={{ color: '#3b82f6', fontWeight: 700 }}>
              {nombrePaciente}
            </span>
          </p>
        </div>

        {/* Info Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {[
            { icon: <ClipboardList size={22} />, label: 'Categorías', value: totalCategorias },
            { icon: <Brain size={22} />, label: 'Puntaje máximo', value: puntajeMaximo },
            { icon: <Clock size={22} />, label: 'Duración aprox.', value: '10-15 min' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                borderRadius: '1rem',
                padding: '1.25rem 1rem',
                textAlign: 'center',
                border: '1px solid #bae6fd',
              }}
            >
              <div
                style={{
                  color: '#3b82f6',
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                {item.icon}
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                {item.value}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '1rem',
            }}
          >
            Instrucciones para el evaluador
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'La prueba se divide en categorías que se presentan en orden.',
              'Cada ítem vale 1 punto (correcto) o 0 puntos (incorrecto).',
              'Para "Atención y Cálculo", elija una sola opción de aplicación.',
              'Marque cada respuesta del paciente como correcta o incorrecta.',
              'El progreso se guarda automáticamente al avanzar de sección.',
              'Al finalizar se calculará el puntaje total automáticamente.',
            ].map((text, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                  fontSize: '0.9rem',
                  color: '#475569',
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    minWidth: '22px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    marginTop: '1px',
                  }}
                >
                  {idx + 1}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={onIniciar}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '0.875rem',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff',
            fontSize: '1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(59,130,246,0.35)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(59,130,246,0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59,130,246,0.35)';
          }}
        >
          Iniciar Evaluación
          <ArrowRight size={20} />
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}
