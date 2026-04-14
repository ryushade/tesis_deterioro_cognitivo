import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InstruccionesCDT from "./InstruccionesCDT";
import UploadCDT from "./UploadCDT";
import ResultadosCDT from "./ResultadosCDT";
import { toast } from "sonner";
import { apiClient } from "@/services/api";

export default function CDTAdminister() {
  const { id_codigo } = useParams();
  
  const [step, setStep] = useState(1);
  const [pacienteNombre, setPacienteNombre] = useState<string>("Paciente");
  const [resultadoMock, setResultadoMock] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    // El nombre viene del backend al hacer login, lo guardamos en localStorage
    const nombre = localStorage.getItem("nombrePaciente");
    if (nombre) {
      setPacienteNombre(nombre);
    }
  }, []);

  const handleNextInstruction = () => setStep(2);
  
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    toast.loading("Analizando dibujo con IA...", { id: "uploading" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Enviamos el id_asignacion para que el backend asocie la evaluación
      if (id_codigo) {
        formData.append("id_asignacion", id_codigo);
      }
      
      const response = await apiClient.post("/cdt/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.success) {
        setResultadoMock(response.data.resultado);
        setUploadError(null);
        toast.success("Foto procesada con éxito", { id: "uploading" });
        setStep(3);
      } else {
        const msg = response.data?.message || "Error al procesar la imagen";
        setUploadError(msg);
        toast.dismiss("uploading");
      }
    } catch (e: any) {
      const mensaje = e?.response?.data?.message || e?.message || "Error al procesar la imagen";
      setUploadError(mensaje);
      toast.dismiss("uploading");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        {step === 1 && <InstruccionesCDT nombrePaciente={pacienteNombre} onNext={handleNextInstruction} />}
        
        {step === 2 && (
          <div className="w-full relative">
            {isUploading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
                 <div className="w-16 h-16 border-4 border-[#3b5bdb] border-t-transparent border-solid rounded-full animate-spin"></div>
                 <p className="mt-4 font-bold text-[#1a2b4b]">Procesando imagen...</p>
                 <p className="text-sm text-gray-500">Nuestros modelos están analizando los trazos</p>
              </div>
            )}
            <UploadCDT
              nombrePaciente={pacienteNombre}
              onNext={handleFileUpload}
              error={uploadError}
              onClearError={() => setUploadError(null)}
            />
          </div>
        )}

        {step === 3 && <ResultadosCDT nombrePaciente={pacienteNombre} resultado={resultadoMock} />}
      </div>
    </div>
  );
}
