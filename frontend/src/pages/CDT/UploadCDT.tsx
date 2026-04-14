import { useState } from "react";
import { Upload, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadCDT({ nombrePaciente, onNext }: { nombrePaciente: string; onNext: (file: File) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleEnviar = () => {
    if (selectedFile) {
      onNext(selectedFile);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 font-sans animate-in fade-in duration-500 w-full">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1a2b4b] tracking-tight">
            Subir dibujo
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm sm:text-base">
            Prueba del reloj - {nombrePaciente}
          </p>
        </div>

        {/* Upload Zone */}
        <div className="relative border-2 border-dashed border-gray-200 rounded-2xl bg-[#fafafa] flex flex-col items-center justify-center p-8 min-h-[300px] overflow-hidden">
          {!preview ? (
            <>
              <input
                type="file"
                accept="image/jpeg, background/png, image/png, image/heic"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#3b5bdb] flex items-center justify-center mb-4">
                <Upload className="w-6 h-6" strokeWidth={2} />
              </div>
              <p className="text-[#1a2b4b] font-semibold text-lg">Toca para subir la foto</p>
              <p className="text-gray-400 text-sm mt-1">JPG, PNG o HEIC · Máximo 10 MB</p>
            </>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <button
                onClick={removeFile}
                className="absolute -top-4 -right-4 z-10 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={preview}
                alt="Dibujo del Reloj"
                className="max-h-[300px] w-auto h-auto rounded object-contain shadow-sm"
              />
              <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-gray-600 shadow-sm backdrop-blur-sm">
                 <span className="truncate max-w-[150px]">{selectedFile?.name}</span>
              </div>
              <div className="absolute bottom-2 right-2 text-white/80">
                 ✨
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="mt-8">
          <Button
            onClick={handleEnviar}
            disabled={!selectedFile}
            className={`w-full py-7 text-lg font-bold flex items-center justify-center gap-2 rounded-2xl transition-all ${
              selectedFile
                ? "bg-[#3b5bdb] hover:bg-[#324fbe] text-white shadow-lg shadow-blue-600/20 hover:translate-y-[-2px]"
                : "bg-blue-200 text-white cursor-not-allowed"
            }`}
          >
            Enviar prueba
          </Button>
        </div>
      </div>
    </div>
  );
}
