import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecordProps {
  nombrePaciente: string;
  onFinished: (audioBlob: Blob) => void;
  onBack?: () => void;
}

const PREGUNTAS = [
  { id: 1, tipo: "Descripción narrativa", texto: "Por favor, cuéntenos cómo es un día normal en su vida. ¿Qué hace desde que se levanta hasta que se acuesta?" },
  { id: 2, tipo: "Fluidez semántica", texto: "Por favor, nombre todos los animales que le vengan a la mente durante un minuto." },
  { id: 3, tipo: "Fluidez fonémica", texto: "Por favor, diga todas las palabras que empiecen con la letra 'P' durante un minuto." },
  { id: 4, tipo: "Repetición de oraciones", texto: "Por favor, repita la siguiente oración: 'El gato se esconde bajo el sofá cuando llueve'." },
  { id: 5, tipo: "Recuerdo", texto: "Por favor, cuénteme con la mayor cantidad de detalles un evento importante o viaje reciente que haya realizado." }
];

export default function VoiceRecord({ nombrePaciente, onFinished, onBack }: VoiceRecordProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const preguntaActual = PREGUNTAS[currentIndex];

  useEffect(() => {
    // Solicitar permisos al montar
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          onFinished(audioBlob);
        };
      })
      .catch(err => {
        console.error("Error micrófono:", err);
        toast.error("No se pudo acceder al micrófono. Por favor, asigne permisos en su navegador.");
      });

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleMicClick = () => {
    if (!mediaRecorderRef.current) return;

    if (!isRecording && !isPaused) {
      // Iniciar grabacion global
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } else if (isRecording && !isPaused) {
      // Pausar grabacion y avanzar
      mediaRecorderRef.current.pause();
      setIsRecording(false);
      setIsPaused(true);
      
      avanzarPregunta();
    } else if (!isRecording && isPaused) {
      // Reanudar grabacion para la siguiente pregunta
      mediaRecorderRef.current.resume();
      setIsRecording(true);
      setIsPaused(false);
    }
  };

  const avanzarPregunta = () => {
    if (currentIndex < PREGUNTAS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Es la ultima pregunta, detener todo
      mediaRecorderRef.current?.stop();
    }
  };

  return (
    <div className="flex items-center justify-center p-4 font-sans animate-in fade-in duration-500 w-full">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 relative">
        
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-500 font-medium">Pregunta {preguntaActual.id} de {PREGUNTAS.length}</span>
          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
            {preguntaActual.tipo}
          </span>
        </div>
        
        {/* Divider */}
        <div className="h-1 w-full bg-gray-50 rounded-full mb-8 overflow-hidden">
           <div 
             className="h-full bg-blue-500 transition-all duration-300" 
             style={{ width: `${((currentIndex) / PREGUNTAS.length) * 100}%` }}
           />
        </div>

        {/* Question Card */}
        <div className="bg-[#f8f9fc] rounded-2xl p-8 mb-10 min-h-[160px] flex items-center justify-center text-center">
          <p className="text-xl sm:text-2xl text-[#1a2b4b] font-medium leading-relaxed">
            {preguntaActual.texto}
          </p>
        </div>

        {/* Mic Control */}
        <div className="flex flex-col items-center justify-center mb-8">
          <button
            onClick={handleMicClick}
            className={`w-32 h-32 rounded-[32px] flex items-center justify-center shadow-lg transition-all duration-300 ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 scale-105 animate-pulse" 
                : "bg-[#3b5bdb] hover:bg-[#324fbe] shadow-blue-500/30 hover:scale-105"
            }`}
          >
            {isRecording ? (
              <Square className="w-12 h-12 text-white fill-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
          
          <p className="text-gray-500 mt-6 font-medium text-center">
            {isRecording 
             ? "Grabando... pulse el botón cuadrado para detener y avanzar" 
             : currentIndex === 0 
                ? "Pulse el micrófono para comenzar a grabar"
                : "Pulse el micrófono para responder esta pregunta"}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 mt-10">
          {nombrePaciente} · Test de Fluidez Verbal
        </div>

        {/* Back Button */}
        {onBack && currentIndex === 0 && !isRecording && !isPaused && (
           <button 
             onClick={onBack}
             className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
           >
             ← Volver
           </button>
        )}

      </div>
    </div>
  );
}
