import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { authService } from "@/services/auth";
import { codigosAccesoService } from "@/services/codigosAccesoService";
import InstruccionesCDT from "./InstruccionesCDT";
import UploadCDT from "./UploadCDT";
import ResultadosCDT from "./ResultadosCDT";
import { toast } from "sonner";
import { apiClient } from "@/services/api";

export default function CDTAdminister() {
  const { id_codigo } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [pacienteNombre, setPacienteNombre] = useState<string>("Cargando...");
  const [resultadoMock, setResultadoMock] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Como workaround en este MVP, pediremos todos los codigos y buscaremos el que coincida
      // ya que el backend no parece tener /auth/obtener_codigos/:id
      try {
        const res = await codigosAccesoService.getAll({ limit: 1000 });
        if (res.success && res.data) {
          const matched = res.data.find(c => String(c.id_codigo) === String(id_codigo));
          if (matched) {
            setPacienteNombre(`${matched.nombres} ${matched.apellidos}`);
          } else {
            toast.error("Código no encontrado");
            navigate("/codigos-acceso");
          }
        }
      } catch (e) {
        toast.error("Error al cargar paciente");
      }
    }
    loadData();
  }, [id_codigo, navigate]);

  const currentUser = authService.getUserFromStorage();
  const sidebarUser = { 
    name: currentUser?.username || 'Usuario', 
    email: currentUser?.role?.name || 'Rol no definido' 
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const handleNextInstruction = () => setStep(2);
  
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    toast.loading("Analizando dibujo con IA...", { id: "uploading" });
    try {
      // Enviar la imagen
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await apiClient.post("/cdt/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.success) {
        setResultadoMock(response.data.resultado);
        toast.success("Foto procesada con éxito", { id: "uploading" });
        setStep(3);
      } else {
        throw new Error(response.data.message || "Fallo en IA");
      }
    } catch (e: any) {
      toast.error("Error al procesar: " + (e?.message || ""), { id: "uploading" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout user={sidebarUser} onLogout={handleLogout}>
      <div className="min-h-[85vh] bg-gray-50/50 flex items-center justify-center p-4">
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
            <UploadCDT nombrePaciente={pacienteNombre} onNext={handleFileUpload} />
          </div>
        )}

        {step === 3 && <ResultadosCDT nombrePaciente={pacienteNombre} resultado={resultadoMock} />}
      </div>
    </DashboardLayout>
  );
}
