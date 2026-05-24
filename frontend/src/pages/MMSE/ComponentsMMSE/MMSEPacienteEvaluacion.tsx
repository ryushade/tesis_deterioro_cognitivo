import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, ArrowLeft, Loader2, Sparkles, AlertTriangle, 
  Check, Info, HelpCircle, RefreshCw, Eye
} from "lucide-react";
import type { CategoriaMMSE, SeccionMMSE, OpcionMMSE, ItemMMSE } from "@/services/mmseEvaluacionService";
import { mmseEvaluacionService } from "@/services/mmseEvaluacionService";
import type { SeccionPayload, RespuestaItemPayload } from "@/services/mmseEvaluacionService";

interface Props {
  categorias: CategoriaMMSE[];
  idEvaluacion: number;
  onFinalizar: () => void;
}

interface UserAnswer {
  value: string;
  correcto: boolean;
  puntaje: 0 | 1;
  base64Image?: string;
}

export default function MMSEPacienteEvaluacion({ categorias, idEvaluacion, onFinalizar }: Props) {
  // Step list mapping
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, UserAnswer>>({});
  const [selectedAtencionOpcionId, setSelectedAtencionOpcionId] = useState<number | null>(null);
  
  // Status states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Special Interactive States
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);
  
  const [pasoTresState, setPasoTresState] = useState<"idle" | "azul_clicked" | "waiting" | "countdown_done" | "completed">("idle");
  const [pasoTresTimer, setPasoTresTimer] = useState(3);
  const pasoTresInterval = useRef<NodeJS.Timeout | null>(null);

  // Drawing Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Build the list of steps dynamically
  useEffect(() => {
    buildSteps();
  }, [categorias, selectedAtencionOpcionId]);

  const buildSteps = () => {
    const list: any[] = [];

    categorias.forEach((cat) => {
      cat.secciones.forEach((sec) => {
        const isAtencion = sec.nombre_seccion.toLowerCase().includes("atención") || sec.nombre_seccion.toLowerCase().includes("calculo");
        
        if (isAtencion) {
          // If no option has been selected yet, insert a Choice step
          if (selectedAtencionOpcionId === null) {
            list.push({
              type: "atencion_choice",
              categoria: cat,
              seccion: sec,
              texto_pregunta: "Elija qué actividad de cálculo o atención prefiere realizar:"
            });
            return;
          }

          // Use the selected option
          const opc = sec.opciones.find(o => o.id_opcion === selectedAtencionOpcionId);
          if (opc) {
            opc.items.forEach((item, idx) => {
              list.push({
                type: "item",
                categoria: cat,
                seccion: sec,
                opcion: opc,
                item: item,
                idxInSection: idx,
                totalItemsInSection: opc.items.length
              });
            });
          }
          return;
        }

        // Standard sections (use default/first option)
        const opc = sec.opciones.find(o => o.es_default) || sec.opciones[0];
        if (!opc) return;

        // Custom step for Fijación (Instruction screen first)
        const isFijacion = sec.nombre_seccion.toLowerCase().includes("fijación") || sec.nombre_seccion.toLowerCase().includes("registro");
        if (isFijacion) {
          list.push({
            type: "fijacion_instruction",
            categoria: cat,
            seccion: sec,
            opcion: opc,
            texto_pregunta: "Lea y memorice estas tres palabras. Tendrá que escribirlas a continuación y recordarlas más tarde:"
          });
        }

        // Add standard items
        opc.items.forEach((item, idx) => {
          list.push({
            type: "item",
            categoria: cat,
            seccion: sec,
            opcion: opc,
            item: item,
            idxInSection: idx,
            totalItemsInSection: opc.items.length
          });
        });
      });
    });

    setSteps(list);
  };

  const currentStep = steps[currentStepIdx];
  if (!currentStep) return null;

  // --- AUTO GRADING LOGIC ---
  const autoGrade = (item: ItemMMSE, value: string): { correcto: boolean; puntaje: 0 | 1; base64Image?: string } => {
    const textNorm = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const name = item.texto_item.toLowerCase();

    // 1. Year
    if (name.includes("año") || name.includes("ano")) {
      const currentYear = new Date().getFullYear().toString();
      const isCorrect = textNorm.includes(currentYear);
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    
    // 2. Month
    if (name.includes("mes")) {
      const months = [
        ["enero"], ["febrero"], ["marzo"], ["abril"], 
        ["mayo", "may"], ["junio"], ["julio"], ["agosto"], 
        ["septiembre", "setiembre"], ["octubre"], ["noviembre"], ["diciembre"]
      ];
      const currentMonth = new Date().getMonth();
      const correctNames = months[currentMonth];
      const isCorrect = correctNames.some(m => textNorm.includes(m));
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    
    // 3. Date (day of month)
    if (name.includes("fecha") || name.includes("día del mes") || name.includes("dia del mes")) {
      const currentDate = new Date().getDate().toString();
      const isCorrect = textNorm.includes(currentDate);
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    
    // 4. Day of the week
    if (name.includes("día de la semana") || name.includes("dia de la semana")) {
      const days = [
        ["domingo"], ["lunes"], ["martes"], ["miercoles", "miércoles"], 
        ["jueves"], ["viernes"], ["sabado", "sábado"]
      ];
      const currentDay = new Date().getDay();
      const correctNames = days[currentDay];
      const isCorrect = correctNames.some(d => textNorm.includes(d));
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    
    // 5. Season
    if (name.includes("estación") || name.includes("estacion")) {
      const validSeasons = ["otono", "otoño", "primavera", "verano", "invierno"];
      const isCorrect = validSeasons.some(s => textNorm.includes(s));
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 6. Country
    if (name.includes("país") || name.includes("pais")) {
      const countries = ["peru", "perú", "colombia", "mexico", "méxico", "chile", "ecuador", "argentina", "bolivia", "venezuela", "españa", "espana"];
      const isCorrect = countries.some(c => textNorm.includes(c)) || textNorm.length > 2;
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 7. General spatial (department, city, place, floor)
    if (name.includes("departamento") || name.includes("provincia") || name.includes("estado") || 
        name.includes("ciudad") || name.includes("municipio") || name.includes("lugar") || 
        name.includes("institución") || name.includes("institucion") || name.includes("piso") || 
        name.includes("área") || name.includes("area") || name.includes("ubicación") || name.includes("ubicacion")) {
      const isCorrect = textNorm.length >= 3;
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 8. Word Registration (Fijación) & Recall (Memoria)
    if (name.includes("palabra") || name.includes("recuerdo de palabra")) {
      // We will perform target-independent word checking across the 3 fields 
      // in the submit phase. Here, we grade simply:
      const targetWords = ["peseta", "caballo", "manzana"];
      const isCorrect = targetWords.some(w => textNorm.includes(w));
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 9. Subtractions (93, 86, 79, 72, 65)
    if (name.includes("primer cálculo") || name.includes("primer calculo")) {
      const isCorrect = textNorm === "93";
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    if (name.includes("segundo cálculo") || name.includes("segundo calculo")) {
      const isCorrect = textNorm === "86";
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    if (name.includes("tercer cálculo") || name.includes("tercer calculo")) {
      const isCorrect = textNorm === "79";
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    if (name.includes("cuarto cálculo") || name.includes("cuarto calculo")) {
      const isCorrect = textNorm === "72";
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    if (name.includes("quinto cálculo") || name.includes("quinto calculo")) {
      const isCorrect = textNorm === "65";
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 10. Spelling backwards MUNDO -> O D N U M
    if (name.includes("primera posición") || name.includes("primera posicion")) {
      return { correcto: textNorm === "o", puntaje: textNorm === "o" ? 1 : 0 };
    }
    if (name.includes("segunda posición") || name.includes("segunda posicion")) {
      return { correcto: textNorm === "d", puntaje: textNorm === "d" ? 1 : 0 };
    }
    if (name.includes("tercera posición") || name.includes("tercera posicion")) {
      return { correcto: textNorm === "n", puntaje: textNorm === "n" ? 1 : 0 };
    }
    if (name.includes("cuarta posición") || name.includes("cuarta posicion")) {
      return { correcto: textNorm === "u", puntaje: textNorm === "u" ? 1 : 0 };
    }
    if (name.includes("quinta posición") || name.includes("quinta posicion")) {
      return { correcto: textNorm === "m", puntaje: textNorm === "m" ? 1 : 0 };
    }

    // 11. Object naming
    if (name.includes("nombramiento de objeto 1")) { // Reloj
      const isCorrect = textNorm.includes("reloj");
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    if (name.includes("nombramiento de objeto 2")) { // Lápiz
      const isCorrect = textNorm.includes("lapiz") || textNorm.includes("lápiz");
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 12. Phrase Repetition ("En un trigal había cinco perros")
    if (name.includes("repetición") || name.includes("repeticion")) {
      const phrase = "en un trigal habia cinco perros";
      const isCorrect = textNorm.includes(phrase) || textNorm.replace(/[,.]/g, "") === phrase;
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 13. Three-step interactive task
    if (name.includes("ejecución") || name.includes("ejecucion")) {
      const isCorrect = value === "completed";
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 14. Read & Execute ("Cierre los ojos")
    if (name.includes("lee y ejecuta") || name.includes("lectura")) {
      const isCorrect = value === "completed";
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 15. Sentence Writing
    if (name.includes("escritura")) {
      const wordsCount = textNorm.split(/\s+/).filter(w => w.length > 0).length;
      const isCorrect = wordsCount >= 3 && textNorm.length > 8;
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 16. Figure Copy (Intersecting Pentagons)
    if (name.includes("copia de figura") || name.includes("dibujo") || name.includes("copia de dibujo")) {
      const isCorrect = value === "completed" || value !== "blank";
      let base64Image = undefined;
      if (canvasRef.current) {
        base64Image = canvasRef.current.toDataURL("image/png");
      }
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0, base64Image };
    }

    return { correcto: textNorm.length > 0, puntaje: textNorm.length > 0 ? 1 : 0 };
  };

  // --- HOLD EYE BUTTON LOGIC (Lectura y Acción) ---
  const handleHoldStart = () => {
    setIsHolding(true);
    setHoldProgress(0);
    holdInterval.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdInterval.current!);
          setIsHolding(false);
          // Set answer to completed and auto-advance
          saveItemAnswer("completed");
          return 100;
        }
        return prev + 4; // Takes ~2.5s
      });
    }, 100);
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
    }
  };

  // --- THREE STEP ACTION LOGIC ---
  const handlePasoTresBlue = () => {
    if (pasoTresState === "idle") {
      setPasoTresState("azul_clicked");
      // Start 3-second timer
      setPasoTresTimer(3);
      pasoTresInterval.current = setInterval(() => {
        setPasoTresTimer(prev => {
          if (prev <= 1) {
            clearInterval(pasoTresInterval.current!);
            setPasoTresState("countdown_done");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handlePasoTresGreen = () => {
    if (pasoTresState === "countdown_done") {
      setPasoTresState("completed");
      saveItemAnswer("completed");
    }
  };

  // Cleanup timers on step change
  useEffect(() => {
    return () => {
      if (holdInterval.current) clearInterval(holdInterval.current);
      if (pasoTresInterval.current) clearInterval(pasoTresInterval.current);
    };
  }, [currentStepIdx]);

  // --- DRAWING CANVAS LOGIC ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b"; // Slate-800

    const pos = getEventCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Prevent scrolling on mobile touch
    if (e.cancelable) e.preventDefault();

    const pos = getEventCoords(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const getEventCoords = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // --- SAVE ANSWERS TO DATABASE ---
  const saveItemAnswer = (value: string) => {
    if (currentStep.type === "item") {
      const graded = autoGrade(currentStep.item, value);
      setAnswers(prev => ({
        ...prev,
        [currentStep.item.id_item]: {
          value: value,
          correcto: graded.correcto,
          puntaje: graded.puntaje,
          base64Image: graded.base64Image
        }
      }));
    }
  };

  const handleNextStep = async () => {
    setError(null);

    // If it's the choice of Attention option
    if (currentStep.type === "atencion_choice") {
      if (selectedAtencionOpcionId === null) {
        setError("Por favor, seleccione una opción.");
        return;
      }
      setCurrentStepIdx(currentStepIdx + 1);
      return;
    }

    // If instruction step
    if (currentStep.type === "fijacion_instruction") {
      setCurrentStepIdx(currentStepIdx + 1);
      return;
    }

    // Verify drawing step has contents
    if (currentStep.type === "item" && (currentStep.item.tipo_respuesta === "dibujo" || currentStep.item.texto_item.toLowerCase().includes("dibujo"))) {
      // Check canvas blankness (very simple)
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const isBlank = ctx ? !ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0) : true;
        saveItemAnswer(isBlank ? "blank" : "completed");
      }
    }

    const currentItem = currentStep.item;
    const currentAns = answers[currentItem.id_item];
    const isAnswered = currentAns !== undefined && currentAns.value !== "";

    if (!isAnswered && currentStep.type === "item") {
      setError("Por favor, responda la pregunta antes de continuar.");
      return;
    }

    // Check if this step is the LAST item of a Section
    const isLastOfSection = currentStep.idxInSection === currentStep.totalItemsInSection - 1;

    if (isLastOfSection) {
      setSaving(true);
      try {
        // 1. Save Section
        const secPayload: SeccionPayload = {
          id_evaluacion: idEvaluacion,
          id_seccion: currentStep.seccion.id_seccion,
          id_opcion_aplicada: currentStep.opcion.id_opcion,
          orden_aplicacion: currentStepIdx + 1,
          aplicada: true,
          omitida: false,
        };
        const secRes = await mmseEvaluacionService.guardarSeccion(secPayload);
        if (!secRes.success || !secRes.data) {
          setError(secRes.message || "Error al guardar sección. Intente nuevamente.");
          setSaving(false);
          return;
        }
        const idEvalSeccion = secRes.data.id_eval_seccion;

        // 2. Save Item Responses in this Section
        const sectionItems = currentStep.opcion.items;
        
        // Custom multi-input grading for Word Recall (Memoria) / Registration (Fijación)
        // to check target words order-independently
        const isFijacionOrMemoria = currentStep.seccion.nombre_seccion.toLowerCase().includes("fijación") || 
                                    currentStep.seccion.nombre_seccion.toLowerCase().includes("registro") ||
                                    currentStep.seccion.nombre_seccion.toLowerCase().includes("memoria") ||
                                    currentStep.seccion.nombre_seccion.toLowerCase().includes("recuerdo");

        let customGrades: Record<number, { correcto: boolean; puntaje: 0 | 1 }> = {};

        if (isFijacionOrMemoria) {
          const targetWords = ["peseta", "caballo", "manzana"];
          const userInputs = sectionItems.map((it: any) => {
            const val = answers[it.id_item]?.value || "";
            return val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
          });

          // Count how many unique target words matched
          const matchedWords = new Set<string>();
          userInputs.forEach((input: string) => {
            targetWords.forEach(word => {
              if (input.includes(word)) {
                matchedWords.add(word);
              }
            });
          });

          const matches = matchedWords.size;
          sectionItems.forEach((it: any, idx: number) => {
            // Assign point sequentially up to matches count
            const correct = idx < matches;
            customGrades[it.id_item] = {
              correcto: correct,
              puntaje: correct ? 1 : 0
            };
          });
        }

        // Send each item response to API
        for (const it of sectionItems) {
          const ans = answers[it.id_item];
          const grade = isFijacionOrMemoria ? customGrades[it.id_item] : { correcto: ans.correcto, puntaje: ans.puntaje };
          
          const respPayload: RespuestaItemPayload = {
            id_eval_seccion: idEvalSeccion,
            id_opcion: currentStep.opcion.id_opcion,
            id_item: it.id_item,
            respuesta_texto: ans.value,
            correcto: grade.correcto,
            puntaje: grade.puntaje,
            archivo_evidencia: ans.base64Image || undefined
          };

          const respRes = await mmseEvaluacionService.guardarRespuesta(respPayload);
          if (!respRes.success) {
            setError(respRes.message || `Error al guardar respuesta para: ${it.texto_item}`);
            setSaving(false);
            return;
          }
        }
      } catch (err: any) {
        setError(err.message || "Error de conexión. Verifique su red.");
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    // Go to next step
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      // Finished all steps
      onFinalizar();
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (currentStepIdx > 0) {
      const prevStep = steps[currentStepIdx - 1];
      
      // If we go back past Attention choice or inside it
      if (prevStep.type === "atencion_choice") {
        setSelectedAtencionOpcionId(null);
      }
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  // Render question custom elements
  const renderInputArea = () => {
    if (currentStep.type === "atencion_choice") {
      return (
        <div className="grid grid-cols-1 gap-4 mt-4 max-w-md mx-auto">
          {currentStep.seccion.opciones.map((opc: OpcionMMSE) => (
            <button
              key={opc.id_opcion}
              onClick={() => setSelectedAtencionOpcionId(opc.id_opcion)}
              className={`p-6 text-left rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col justify-between ${
                selectedAtencionOpcionId === opc.id_opcion
                  ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10 text-blue-900"
                  : "border-slate-200 bg-white hover:border-slate-350 text-slate-800"
              }`}
            >
              <span className="font-extrabold text-lg">{opc.nombre_opcion}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">
                {opc.nombre_opcion.toLowerCase().includes("restas") 
                  ? "Cálculos matemáticos progresivos en orden descendente." 
                  : "Deletreo de letras inversamente."}
              </span>
            </button>
          ))}
        </div>
      );
    }

    if (currentStep.type === "fijacion_instruction") {
      return (
        <div className="flex flex-col items-center mt-6 space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-center gap-4 flex-wrap">
            {["PESETA", "CABALLO", "MANZANA"].map((w, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 shadow-inner px-8 py-5 rounded-2xl flex flex-col items-center min-w-[140px] transform hover:scale-105 transition-transform duration-300">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Palabra {idx+1}</span>
                <span className="text-3xl font-black text-slate-800 tracking-tight">{w}</span>
              </div>
            ))}
          </div>
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 max-w-lg">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">
              Léalas en voz alta con atención. Cuando se sienta listo para continuar y escribirlas en el siguiente paso, presione el botón de abajo.
            </p>
          </div>
        </div>
      );
    }

    const item = currentStep.item;
    const ansValue = answers[item.id_item]?.value || "";
    const lowerName = item.texto_item.toLowerCase();

    // 1. Grid choices for Seasons
    if (lowerName.includes("estación") || lowerName.includes("estacion")) {
      const seasons = [
        { label: "Primavera 🌸", val: "Primavera" },
        { label: "Verano ☀", val: "Verano" },
        { label: "Otoño 🍁", val: "Otoño" },
        { label: "Invierno ❄", val: "Invierno" }
      ];
      return (
        <div className="grid grid-cols-2 gap-4 mt-4 max-w-sm mx-auto">
          {seasons.map(s => (
            <button
              key={s.val}
              onClick={() => saveItemAnswer(s.val)}
              className={`py-4 rounded-xl font-bold border transition-all text-sm cursor-pointer ${
                ansValue === s.val
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      );
    }

    // 2. Grid choices for Month
    if (lowerName.includes("mes")) {
      const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 max-w-md mx-auto">
          {months.map(m => (
            <button
              key={m}
              onClick={() => saveItemAnswer(m)}
              className={`py-3 rounded-lg font-bold border transition-all text-xs cursor-pointer ${
                ansValue === m
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      );
    }

    // 3. Grid choices for Day of the Week
    if (lowerName.includes("día de la semana") || lowerName.includes("dia de la semana")) {
      const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 max-w-md mx-auto">
          {days.map(d => (
            <button
              key={d}
              onClick={() => saveItemAnswer(d)}
              className={`py-3 rounded-lg font-bold border transition-all text-xs cursor-pointer ${
                ansValue === d
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      );
    }

    // 4. Object Illustration for Naming (Reloj / Lápiz)
    if (lowerName.includes("nombramiento")) {
      const isWatch = lowerName.includes("objeto 1") || lowerName.includes("reloj");
      return (
        <div className="flex flex-col items-center mt-4 space-y-5 animate-in fade-in duration-300">
          <div className="w-40 h-40 bg-white rounded-2xl shadow-inner border border-slate-100 flex items-center justify-center p-4">
            {isWatch ? (
              // Minimalist premium SVG clock
              <svg viewBox="0 0 100 100" className="w-32 h-32 text-slate-800 drop-shadow-md">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
                <circle cx="50" cy="50" r="2.5" fill="currentColor" />
                <line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="50" y1="50" x2="72" y2="50" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                {/* Numbers markers */}
                <line x1="50" y1="12" x2="50" y2="16" stroke="currentColor" strokeWidth="3" />
                <line x1="88" y1="50" x2="84" y2="50" stroke="currentColor" strokeWidth="3" />
                <line x1="50" y1="88" x2="50" y2="84" stroke="currentColor" strokeWidth="3" />
                <line x1="12" y1="50" x2="16" y2="50" stroke="currentColor" strokeWidth="3" />
              </svg>
            ) : (
              // Minimalist premium SVG pencil
              <svg viewBox="0 0 100 100" className="w-32 h-32 text-slate-800 rotate-45 drop-shadow-md">
                <path d="M10,80 L20,90 L90,20 L80,10 Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10,80 L20,90 L12,93 Z" fill="currentColor" />
                <path d="M85,15 L75,25" stroke="currentColor" strokeWidth="5" />
              </svg>
            )}
          </div>
          <input
            type="text"
            placeholder="¿Qué es este objeto?"
            value={ansValue}
            onChange={(e) => saveItemAnswer(e.target.value)}
            className="w-full max-w-sm px-5 py-4 border-2 border-slate-200 rounded-2xl text-center outline-none focus:border-blue-600 bg-white font-semibold text-lg transition-colors shadow-inner"
            autoFocus
          />
        </div>
      );
    }

    // 5. Deletreo inverso slots (OTP letters)
    if (lowerName.includes("deletreo") || lowerName.includes("posición") || lowerName.includes("posicion")) {
      const idxStr = lowerName.includes("primera") ? "1ra" : 
                     lowerName.includes("segunda") ? "2da" :
                     lowerName.includes("tercera") ? "3ra" :
                     lowerName.includes("cuarta") ? "4ta" : "5ta";
      return (
        <div className="flex flex-col items-center mt-4 space-y-4">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">M-U-N-D-O deletreado al revés</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500 mr-2">Escriba la {idxStr} letra:</span>
            <input
              type="text"
              maxLength={1}
              value={ansValue}
              onChange={(e) => saveItemAnswer(e.target.value)}
              className="w-14 h-16 border-2 border-slate-200 rounded-2xl text-center font-black text-2xl text-slate-800 outline-none focus:border-blue-600 bg-white shadow-inner"
              autoFocus
            />
          </div>
        </div>
      );
    }

    // 6. Interactive 3-step order
    if (lowerName.includes("ejecución del paso") || lowerName.includes("ejecucion del paso")) {
      const stepNum = lowerName.includes("paso 1") ? 1 : lowerName.includes("paso 2") ? 2 : 3;
      return (
        <div className="flex flex-col items-center mt-6 space-y-8 animate-in zoom-in-95 duration-400">
          <div className="w-full max-w-md bg-slate-50/50 rounded-2xl border border-slate-100 p-6 space-y-4 shadow-inner">
            <h4 className="text-sm font-bold text-slate-600 text-center">Tablero de Ejecución Interactiva</h4>
            
            <div className="flex flex-col space-y-3">
              {/* Step 1 check */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold ${
                pasoTresState !== "idle" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-white border-slate-150 text-slate-500"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${pasoTresState !== "idle" ? "bg-emerald-500 text-white" : "bg-slate-200"}`}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Paso 1: Presionar el botón azul</span>
              </div>

              {/* Step 2 check */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold ${
                pasoTresState === "countdown_done" || pasoTresState === "completed" 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                  : pasoTresState === "azul_clicked" ? "bg-blue-50 border-blue-100 text-blue-800" : "bg-white border-slate-150 text-slate-500"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  pasoTresState === "countdown_done" || pasoTresState === "completed" ? "bg-emerald-500 text-white" : pasoTresState === "azul_clicked" ? "bg-blue-500 text-white animate-pulse" : "bg-slate-200"
                }`}>
                  {pasoTresState === "countdown_done" || pasoTresState === "completed" ? <Check size={12} strokeWidth={3} /> : <span className="text-[10px] font-bold">{pasoTresTimer}</span>}
                </div>
                <span>Paso 2: Esperar a que el contador llegue a 0</span>
              </div>

              {/* Step 3 check */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold ${
                pasoTresState === "completed" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-white border-slate-150 text-slate-500"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${pasoTresState === "completed" ? "bg-emerald-500 text-white" : "bg-slate-200"}`}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Paso 3: Presionar el botón verde</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Blue Button */}
            <button
              onClick={handlePasoTresBlue}
              disabled={pasoTresState !== "idle"}
              className={`px-6 py-4 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                pasoTresState === "idle" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20" 
                  : "bg-slate-300 shadow-none cursor-not-allowed opacity-60"
              }`}
            >
              Botón Azul
            </button>

            {/* Green Button */}
            <button
              onClick={handlePasoTresGreen}
              disabled={pasoTresState !== "countdown_done"}
              className={`px-6 py-4 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                pasoTresState === "countdown_done" 
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-500/20 animate-bounce" 
                  : "bg-slate-300 shadow-none cursor-not-allowed opacity-60"
              }`}
            >
              Botón Verde
            </button>
          </div>
        </div>
      );
    }

    // 7. Interactive Hold eyes close
    if (lowerName.includes("lee y ejecuta") || lowerName.includes("lectura")) {
      return (
        <div className="flex flex-col items-center mt-6 space-y-6">
          <p className="text-lg font-extrabold text-[#1a2b4b] uppercase tracking-wide text-center">
            CIERRE LOS OJOS AHORA
          </p>
          <p className="text-xs text-slate-400 font-bold max-w-xs text-center leading-normal">
            Mantenga presionado el botón redondo mientras tiene los ojos cerrados. Suéltelo cuando termine.
          </p>
          
          <div className="relative flex items-center justify-center">
            {/* Hold progress ring */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#f1f5f9"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - holdProgress / 100)}
                strokeLinecap="round"
                className="transition-all duration-100"
              />
            </svg>

            {/* Inner Button */}
            <button
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
              className={`absolute w-24 h-24 rounded-full flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-300 ${
                isHolding 
                  ? "bg-blue-600 text-white scale-95 shadow-inner" 
                  : "bg-gradient-to-tr from-slate-50 to-white border border-slate-200 text-slate-700 shadow-lg"
              }`}
            >
              <Eye className={`w-8 h-8 mb-1 transition-transform duration-500 ${isHolding ? "scale-110" : ""}`} />
              <span className="text-[10px] font-black uppercase tracking-wider">{isHolding ? "Sosteniendo" : "Presione"}</span>
            </button>
          </div>
        </div>
      );
    }

    // 8. Drawing Canvas (Pentagons Copy)
    if (lowerName.includes("dibujo") || lowerName.includes("figura") || lowerName.includes("copia de dibujo")) {
      return (
        <div className="flex flex-col items-center mt-4 space-y-4 animate-in fade-in duration-400">
          {/* Reference drawing */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-inner flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Dibujo de Referencia</span>
            {/* SVG Intersecting Pentagons */}
            <svg width="200" height="110" viewBox="0 0 200 110" className="text-slate-800">
              {/* Pentagon 1 */}
              <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="currentColor" strokeWidth="3.5" />
              {/* Pentagon 2 */}
              <polygon points="120,30 160,30 175,75 135,105 105,75" fill="none" stroke="currentColor" strokeWidth="3.5" />
            </svg>
          </div>

          {/* Interactive drawing area */}
          <div className="relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-inner w-full max-w-md">
            <div className="absolute top-2 left-2 z-10 bg-slate-800/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              <span>Dibuje aquí</span>
            </div>
            <canvas
              ref={canvasRef}
              width={400}
              height={260}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[260px] bg-white cursor-crosshair"
            />
            
            {/* Clean button overlay */}
            <button
              onClick={clearCanvas}
              className="absolute bottom-2 right-2 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all shadow border border-slate-200 cursor-pointer flex items-center gap-1"
            >
              <RefreshCw size={12} /> Limpiar lienzo
            </button>
          </div>
        </div>
      );
    }

    // 9. Standard Text / Number Inputs
    const isNum = item.tipo_respuesta === "numero" || lowerName.includes("año") || lowerName.includes("fecha") || lowerName.includes("cálculo") || lowerName.includes("calculo");
    return (
      <div className="mt-4 max-w-sm mx-auto">
        <input
          type={isNum ? "number" : "text"}
          placeholder={isNum ? "Ingrese el número..." : "Escriba su respuesta..."}
          value={ansValue}
          onChange={(e) => saveItemAnswer(e.target.value)}
          className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-center outline-none focus:border-blue-600 bg-white font-semibold text-lg transition-colors shadow-inner"
          autoFocus
        />
      </div>
    );
  };

  // Navigations details
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === steps.length - 1;
  const progressPercent = steps.length > 0 ? ((currentStepIdx + 1) / steps.length) * 100 : 0;

  // Background and UI structures matching Web Application development guidelines (Wowing Aesthetics)
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/50 max-w-xl w-full rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
      
      {/* Dynamic stepped tracker */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            {currentStep.categoria?.nombre_categoria || "Prueba cognitiva"}
          </span>
          <span className="font-bold text-blue-600">{Math.round(progressPercent)}% completado</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
          <div 
            style={{ width: `${progressPercent}%` }} 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 shadow-md"
          />
        </div>
      </div>

      {/* Main question card */}
      <div className="text-center py-4 space-y-4">
        {currentStep.type === "item" && (
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider">
            {currentStep.seccion.nombre_seccion} 
            {currentStep.totalItemsInSection > 1 && ` (${currentStep.idxInSection + 1}/${currentStep.totalItemsInSection})`}
          </span>
        )}
        
        <h2 className="text-2xl sm:text-3xl font-black text-[#1a2b4b] tracking-tight leading-tight">
          {currentStep.type === "item" ? currentStep.item.texto_item : currentStep.texto_pregunta}
        </h2>
        
        {currentStep.type === "item" && currentStep.item.criterio_correccion && (
          <p className="text-xs text-slate-400 font-medium italic mt-1 px-4 leading-normal">
            {currentStep.item.criterio_correccion}
          </p>
        )}
      </div>

      {/* Dynamic input area */}
      <div className="py-2 min-h-[140px] flex items-center justify-center">
        {renderInputArea()}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 text-red-800 text-xs font-semibold animate-bounce">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between gap-4">
        <button
          onClick={handlePrevStep}
          disabled={isFirstStep || saving}
          className={`px-5 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 border transition-all cursor-pointer ${
            isFirstStep || saving
              ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-350"
          }`}
        >
          <ArrowLeft size={16} /> Atrás
        </button>

        <button
          onClick={handleNextStep}
          disabled={saving}
          className="px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
            </>
          ) : isLastStep ? (
            <>
              Finalizar <Check size={16} strokeWidth={3} />
            </>
          ) : (
            <>
              Siguiente <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
