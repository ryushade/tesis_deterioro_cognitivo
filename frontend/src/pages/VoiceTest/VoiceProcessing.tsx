import { Loader2 } from "lucide-react";

export default function VoiceProcessing() {
  return (
    <div className="flex items-center justify-center p-4 font-sans w-full">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-extrabold text-[#1a2b4b]">Analizando grabación...</h2>
        <p className="text-gray-500 mt-2 font-medium">Nuestros modelos de inteligencia artificial están procesando el audio y realizando la transcripción. Por favor espere, esto tomará unos segundos.</p>
      </div>
    </div>
  );
}
