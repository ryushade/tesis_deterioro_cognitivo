import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VoiceInstrucciones from "./VoiceInstrucciones";
import VoiceRecord from "./VoiceRecord";
import VoiceProcessing from "./VoiceProcessing";
import VoiceResultados from "./VoiceResultados";
import { toast } from "sonner";

export default function VoiceTestAdminister() {
  const { id_codigo } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [pacienteNombre, setPacienteNombre] = useState<string>("Paciente");
  const [resultadoMock, setResultadoMock] = useState<any>(null);

  useEffect(() => {
    const nombre = localStorage.getItem("nombrePaciente");
    if (nombre) {
      setPacienteNombre(nombre);
    }
  }, []);

  const handleNextInstruction = () => setStep(2);
  const handleBackToDashboard = () => navigate(-1);
  const handleBackToInstructions = () => setStep(1);

  const handleAudioFinished = async (audioBlob: Blob) => {
    setStep(3); // Procesando
    
    // Aquí es donde en el futuro se conectará la API REAL de Flask
    // simulamos el tiempo de espera por ahora de 3 segundos
    setTimeout(() => {
      // Mock result (para demostración UI)
      const isAlerta = Math.random() > 0.5;
      setResultadoMock({
        clase_predicha: isAlerta ? 1 : 0,
        alerta: isAlerta,
        confianza: (Math.random() * 20 + 75).toFixed(1), // 75-95%
        transcripcion: "Hola, bueno, un día normal en mi vida... me levanto temprano, tipo seis y media de la mañana. Tomo un café, leo el periódico un rato. Luego salgo a caminar si no hace mucho frío. Almuerzo con mi esposa, dormimos un rato y ya en la noche vemos televisión hasta las nueve. Los animales... perro, gato, caballo... mm, ardilla y loro. Palabras con P: pato, puerta, pared, piedra... El gato se esconde bajo el sofá cuando llueve. La película fue bonita, trataba de unos perros.",
        metricas: {}
      });
      setStep(4); // Resultados
      toast.success("Análisis completado");
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        {step === 1 && (
          <VoiceInstrucciones 
            nombrePaciente={pacienteNombre} 
            onNext={handleNextInstruction} 
            onBack={handleBackToDashboard} 
          />
        )}
        
        {step === 2 && (
          <VoiceRecord 
            nombrePaciente={pacienteNombre} 
            onFinished={handleAudioFinished}
            onBack={handleBackToInstructions}
          />
        )}

        {step === 3 && (
          <VoiceProcessing />
        )}

        {step === 4 && (
          <VoiceResultados 
            nombrePaciente={pacienteNombre} 
            resultado={resultadoMock} 
          />
        )}
      </div>
    </div>
  );
}
