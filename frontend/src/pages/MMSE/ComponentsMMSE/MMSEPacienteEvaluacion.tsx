import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, ArrowLeft, Loader2, Sparkles, AlertTriangle, 
  Check, Info, HelpCircle, RefreshCw, Eye, Clock, BookOpen,
  Mic, Square, Play, Trash2, Volume2
} from "lucide-react";
import type { CategoriaMMSE, SeccionMMSE, OpcionMMSE, ItemMMSE, RespuestaGuardadaSeccion } from "@/services/mmseEvaluacionService";
import { mmseEvaluacionService } from "@/services/mmseEvaluacionService";
import type { SeccionPayload, RespuestaItemPayload } from "@/services/mmseEvaluacionService";
import type { OrientacionEspacialData } from "./MMSEOrientacionEspacialSetup";
import RelojImage from "../assets/Reloj.webp";
import LapizImage from "../assets/Lapiz.webp";

interface Props {
  categorias: CategoriaMMSE[];
  idEvaluacion: number;
  onFinalizar: (tiempos?: Record<string, number>) => void;
  tiempoLimite?: number;
  orientacionEspacial?: OrientacionEspacialData;
  respuestasGuardadas?: RespuestaGuardadaSeccion[];
  duracionAcumulada?: number;
}

interface UserAnswer {
  value: string;
  correcto: boolean;
  puntaje: 0 | 1;
  base64Image?: string;
}

const getCategoryKey = (step: any): string => {
  return step?.categoria?.nombre_categoria ?? "";
};

const normalizeString = (str: string): string => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^(en\s+|el\s+|la\s+|un\s+|una\s+|de\s+)/g, "")
    .trim();
};

const formatToSentenceCase = (str: string): string => {
  const trimmed = str.trim();
  if (trimmed.length === 0) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const playBeep = (frequency: number, duration: number) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Smooth ramp down to avoid clicks/pops
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio Context not supported or allowed:", e);
  }
};

export default function MMSEPacienteEvaluacion({ 
  categorias, 
  idEvaluacion, 
  onFinalizar, 
  tiempoLimite, 
  orientacionEspacial,
  respuestasGuardadas,
  duracionAcumulada
}: Props) {
  // Pre-load answers from respuestasGuardadas
  const initialAnswers = (() => {
    const loadedAnswers: Record<number, UserAnswer> = {};
    if (respuestasGuardadas) {
      respuestasGuardadas.forEach(rg => {
        rg.items.forEach(ri => {
          loadedAnswers[ri.id_item] = {
            value: ri.respuesta_texto || "",
            correcto: ri.correcto || false,
            puntaje: ri.puntaje
          };
        });
      });
    }
    return loadedAnswers;
  })();

  const initialAtencionOpcionId = (() => {
    if (respuestasGuardadas) {
      const atencionSectionIds = new Set<number>();
      categorias.forEach(cat => {
        cat.secciones.forEach(sec => {
          const nameLower = sec.nombre_seccion.toLowerCase();
          if (nameLower.includes("atención") || nameLower.includes("calculo")) {
            atencionSectionIds.add(sec.id_seccion);
          }
        });
      });

      const savedAtencionSec = respuestasGuardadas.find(rg => atencionSectionIds.has(rg.id_seccion));
      if (savedAtencionSec) {
        return savedAtencionSec.id_opcion_aplicada;
      }
    }
    return null;
  })();

  // Step list mapping
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, UserAnswer>>(initialAnswers);
  const answersRef = useRef<Record<number, UserAnswer>>(initialAnswers);
  const [selectedAtencionOpcionId, setSelectedAtencionOpcionId] = useState<number | null>(initialAtencionOpcionId);
  
  // Status states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time tracking states
  const [elapsedSeconds, setElapsedSeconds] = useState(duracionAcumulada || 0);

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


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Special Interactive States
  const [isEyeTestCounting, setIsEyeTestCounting] = useState(false);
  const [eyeTestCountdown, setEyeTestCountdown] = useState(5);
  const eyeTestIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsEyeTestCounting(false);
    setEyeTestCountdown(5);
    if (eyeTestIntervalRef.current) {
      clearInterval(eyeTestIntervalRef.current);
      eyeTestIntervalRef.current = null;
    }
  }, [currentStepIdx]);
  
  // Paper folding task states
  const [isPaperPickedUp, setIsPaperPickedUp] = useState(false);
  const [isPaperFolded, setIsPaperFolded] = useState(false);
  const [isPaperOnFloor, setIsPaperOnFloor] = useState(false);

  // Dynamic choices for orientation questions
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);

  // Drawing Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const subtractionRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recallRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- VOICE RECORDING FOR REPETITION TASK ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up recording timer on unmount/step change
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [currentStepIdx]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const options = { mimeType: 'audio/webm' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setRecordedBlob(audioBlob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          if (currentStep.type === "item") {
            const idItem = currentStep.item.id_item;
            const newAnswer = {
              value: "audio_recorded",
              correcto: true,
              puntaje: 1 as 0 | 1,
              base64Image: base64Data
            };
            answersRef.current[idItem] = newAnswer;
            setAnswers(prev => ({
              ...prev,
              [idItem]: newAnswer
            }));
            setError(null);
          }
        };

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setAudioUrl(null);
      setRecordedBlob(null);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.error("Error al acceder al micrófono:", e);
      setError("No se pudo acceder al micrófono. Verifique los permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const discardRecording = () => {
    setAudioUrl(null);
    setRecordedBlob(null);
    if (currentStep.type === "item") {
      const idItem = currentStep.item.id_item;
      setAnswers(prev => {
        const copy = { ...prev };
        delete copy[idItem];
        return copy;
      });
      if (answersRef.current[idItem]) {
        delete answersRef.current[idItem];
      }
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // Build the list of steps dynamically
  useEffect(() => {
    buildSteps();
  }, [categorias, selectedAtencionOpcionId]);

  // Resume progress to the first incomplete step
  useEffect(() => {
    if (steps.length > 0 && !hasResumed && respuestasGuardadas && respuestasGuardadas.length > 0) {
      let resumeIdx = 0;
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        let stepCompleted = false;

        if (step.type === "item") {
          const ans = initialAnswers[step.item.id_item];
          stepCompleted = ans !== undefined && ans.value !== "";
        } else if (step.type === "restas_seriadas") {
          stepCompleted = step.items.every((it: any) => {
            const ans = initialAnswers[it.id_item];
            return ans !== undefined && ans.value !== "";
          });
        } else if (step.type === "recuerdo_diferido") {
          stepCompleted = step.items.every((it: any) => {
            const ans = initialAnswers[it.id_item];
            return ans !== undefined && ans.value !== "";
          });
        } else if (step.type === "orden_tres_pasos") {
          stepCompleted = step.items.every((it: any) => {
            const ans = initialAnswers[it.id_item];
            return ans !== undefined && ans.value !== "";
          });
        } else if (step.type === "fijacion_instruction") {
          const nextItems = step.seccion.opciones.find((o: any) => o.es_default)?.items || [];
          stepCompleted = nextItems.every((it: any) => {
            const ans = initialAnswers[it.id_item];
            return ans !== undefined && ans.value !== "";
          });
        } else if (step.type === "atencion_choice") {
          stepCompleted = selectedAtencionOpcionId !== null;
        }

        if (!stepCompleted) {
          resumeIdx = i;
          break;
        }
        
        if (i === steps.length - 1) {
          resumeIdx = steps.length - 1;
        }
      }
      setCurrentStepIdx(resumeIdx);
      setHasResumed(true);
    }
  }, [steps, hasResumed, respuestasGuardadas]);

  const buildSteps = () => {
    const list: any[] = [];

    // Sort categories clinically to match standard MMSE flow:
    // 1. Orientación (temporal / espacial)
    // 2. Fijación (Registro de palabras)
    // 3. Atención y cálculo (Restas seriadas)
    // 4. Memoria (Recuerdo diferido)
    // 5. Lenguaje y Praxis (Nombramiento, Repetición, 3 pasos, Lectura, Escritura, Dibujo)
    const getCategoryOrder = (cat: CategoriaMMSE): number => {
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

    sortedCategorias.forEach((cat) => {
      const sortedSecciones = [...cat.secciones].sort((a, b) => a.orden - b.orden);
      sortedSecciones.forEach((sec) => {
        const nameLower = sec.nombre_seccion.toLowerCase();
        const isAtencion = nameLower.includes("atención") || nameLower.includes("calculo");
        
        if (isAtencion) {
          // Elegir automáticamente Restas Seriadas para omitir la pantalla de elección
          const opc = sec.opciones.find(o => o.nombre_opcion.toLowerCase().includes("restas") || o.nombre_opcion.toLowerCase().includes("calculo")) || sec.opciones[0];
          if (opc) {
            list.push({
              type: "restas_seriadas",
              categoria: cat,
              seccion: sec,
              opcion: opc,
              items: opc.items
            });
          }
          return;
        }

        // Standard sections (use default/first option)
        const opc = sec.opciones.find(o => o.es_default) || sec.opciones[0];
        if (!opc) return;

        // Skip figure copy / drawing section entirely (inflexible on digital devices)
        const isFiguraCopia = opc.items.some((it: any) => {
          const t = it.texto_item.toLowerCase();
          return t.includes("dibujo") || t.includes("copia de figura") || t.includes("copia de dibujo");
        }) || nameLower.includes("copia") || nameLower.includes("visoconstr");
        if (isFiguraCopia) {
          return; // Skip this section entirely
        }

        // Custom step for Fijación (Instruction screen first)
        const isFijacion = nameLower.includes("fijación") || nameLower.includes("registro");
        if (isFijacion) {
          list.push({
            type: "fijacion_instruction",
            categoria: cat,
            seccion: sec,
            opcion: opc,
            texto_pregunta: "Lea y memorice estas tres palabras. Tendrá que escribirlas a continuación y recordarlas más tarde:"
          });
        }

        // Custom step for Recuerdo Diferido (Delayed Recall) — group all recall items in one screen
        const isRecuerdoDiferido = nameLower.includes("recuerdo") || nameLower.includes("memoria") || nameLower.includes("evocación");
        if (isRecuerdoDiferido && !isFijacion) {
          list.push({
            type: "recuerdo_diferido",
            categoria: cat,
            seccion: sec,
            opcion: opc,
            items: opc.items,
            texto_pregunta: "¿Recuerda las 3 palabras que memorizó al inicio?"
          });
          return;
        }

        // Custom step for three-step interactive paper task
        const isTresPasos = nameLower.includes("tres pasos") || nameLower.includes("orden de tres");
        if (isTresPasos) {
          list.push({
            type: "orden_tres_pasos",
            categoria: cat,
            seccion: sec,
            opcion: opc,
            items: opc.items
          });
          return;
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

  // Cleanup timers on step change
  useEffect(() => {
    if (currentStep?.type === "restas_seriadas") {
      setTimeout(() => {
        subtractionRefs.current[0]?.focus();
      }, 100);
    }
    if (currentStep?.type === "recuerdo_diferido") {
      setTimeout(() => {
        recallRefs.current[0]?.focus();
      }, 100);
    }
    return () => {
      if (eyeTestIntervalRef.current) {
        clearInterval(eyeTestIntervalRef.current);
        eyeTestIntervalRef.current = null;
      }
    };
  }, [currentStepIdx, currentStep]);

  // Dynamic option generation & shuffling for orientation questions and Paper states loading
  useEffect(() => {
    if (!currentStep) {
      setShuffledChoices([]);
      return;
    }

    if (currentStep.type === "orden_tres_pasos") {
      const items = currentStep.items;
      const ans1 = answersRef.current[items[0]?.id_item]?.value === "completed";
      const ans2 = answersRef.current[items[1]?.id_item]?.value === "completed";
      const ans3 = answersRef.current[items[2]?.id_item]?.value === "completed";
      setIsPaperPickedUp(ans1);
      setIsPaperFolded(ans2);
      setIsPaperOnFloor(ans3);
      setShuffledChoices([]);
      return;
    }

    if (currentStep.type !== "item") {
      setShuffledChoices([]);
      return;
    }

    const item = currentStep.item;
    const lowerName = item.texto_item.toLowerCase();

    const generateUniqueChoices = (correctVal: string, defaultOptions: string[]) => {
      const formattedCorrect = formatToSentenceCase(correctVal);
      const normalizedCorrect = normalizeString(correctVal);
      const uniqueDistractors = defaultOptions
        .filter(opt => normalizeString(opt) !== normalizedCorrect)
        .map(opt => formatToSentenceCase(opt));
      
      const pool = [formattedCorrect, ...uniqueDistractors.slice(0, 3)];
      return [...new Set(pool)].sort(() => Math.random() - 0.5);
    };

    if (lowerName.includes("año") || lowerName.includes("ano")) {
      const correctYear = orientacionEspacial?.anio 
        ? orientacionEspacial.anio.trim()
        : new Date().getFullYear().toString();
      const yrNum = parseInt(correctYear) || new Date().getFullYear();
      const choices = [
        (yrNum - 1).toString(),
        yrNum.toString(),
        (yrNum + 1).toString(),
        (yrNum + 2).toString()
      ];
      setShuffledChoices(generateUniqueChoices(correctYear, choices));
    } else if (lowerName.includes("fecha") || lowerName.includes("día del mes") || lowerName.includes("dia del mes")) {
      const correct = orientacionEspacial?.diaMes && orientacionEspacial?.mes && orientacionEspacial?.anio
        ? `${orientacionEspacial.diaMes} de ${orientacionEspacial.mes} de ${orientacionEspacial.anio}`
        : (() => {
            const now = new Date();
            const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            return `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
          })();

      // Generate distractors relative to the configured date
      const currentMonth = orientacionEspacial?.mes || ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][new Date().getMonth()];
      const currentYear = orientacionEspacial?.anio || new Date().getFullYear().toString();
      const currentDay = orientacionEspacial?.diaMes || new Date().getDate().toString();

      const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const mIdx = months.indexOf(currentMonth) !== -1 ? months.indexOf(currentMonth) : new Date().getMonth();
      const prevMonth = months[(mIdx - 1 + 12) % 12];
      const nextMonth = months[(mIdx + 1) % 12];

      const inc1 = `${currentDay} de ${prevMonth} de ${currentYear}`;
      const bgDay = parseInt(currentDay) || 15;
      const inc2 = `${currentDay} de ${nextMonth} de ${currentYear}`;
      const inc3 = `${bgDay === 31 ? 30 : bgDay + 1} de ${prevMonth} de ${currentYear}`;

      const choices = [inc1, inc2, inc3];
      setShuffledChoices(generateUniqueChoices(correct, choices));
    } else if (lowerName.includes("estación") || lowerName.includes("estacion")) {
      const correct = orientacionEspacial?.estacion || "Otoño";
      const seasons = ["Primavera", "Verano", "Otoño", "Invierno"];
      setShuffledChoices(generateUniqueChoices(correct, seasons));
    } else if (lowerName.includes("mes")) {
      const correct = orientacionEspacial?.mes || ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][new Date().getMonth()];
      const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const mIdx = months.indexOf(correct) !== -1 ? months.indexOf(correct) : new Date().getMonth();
      const choices = [
        months[(mIdx + 1) % 12],
        months[(mIdx + 2) % 12],
        months[(mIdx + 3) % 12]
      ];
      setShuffledChoices(generateUniqueChoices(correct, choices));
    } else if (lowerName.includes("día de la semana") || lowerName.includes("dia de la semana")) {
      const correct = orientacionEspacial?.diaSemana || ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][new Date().getDay()];
      const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      setShuffledChoices(generateUniqueChoices(correct, days));
    } else if (lowerName.includes("país") || lowerName.includes("pais")) {
      const correct = orientacionEspacial?.pais || "Perú";
      const allOptions = ["Perú", "Colombia", "Ecuador", "Chile", "Bolivia", "Argentina"];
      setShuffledChoices(generateUniqueChoices(correct, allOptions));
    } else if (lowerName.includes("departamento") || lowerName.includes("provincia") || lowerName.includes("estado")) {
      const correct = orientacionEspacial?.departamento || "Lambayeque";
      const allOptions = ["Lambayeque", "Lima", "La Libertad", "Piura", "Cajamarca", "Arequipa"];
      setShuffledChoices(generateUniqueChoices(correct, allOptions));
    } else if (lowerName.includes("ciudad") || lowerName.includes("municipio") || lowerName.includes("distrito")) {
      const correct = orientacionEspacial?.ciudad || "Chiclayo";
      const allOptions = ["Chiclayo", "Lima", "Trujillo", "Piura", "Arequipa", "Cajamarca"];
      setShuffledChoices(generateUniqueChoices(correct, allOptions));
    } else if (lowerName.includes("lugar") || lowerName.includes("institución") || lowerName.includes("institucion") || lowerName.includes("establecimiento")) {
      const correct = orientacionEspacial?.lugar || "Casa";
      const allOptions = ["Casa", "Hospital", "Consultorio", "Centro de Salud", "Clínica", "Asilo de Ancianos"];
      setShuffledChoices(generateUniqueChoices(correct, allOptions));
    } else if (lowerName.includes("piso") || lowerName.includes("área") || lowerName.includes("area") || lowerName.includes("sala") || lowerName.includes("ubicación") || lowerName.includes("ubicacion")) {
      const correct = orientacionEspacial?.piso || "1er piso";
      const allOptions = ["Planta baja", "1er piso", "2do piso", "3er piso", "Sala de estar", "Habitación"];
      setShuffledChoices(generateUniqueChoices(correct, allOptions));
    } else {
      setShuffledChoices([]);
    }
  }, [currentStepIdx, currentStep, steps, orientacionEspacial]);

  if (!currentStep) return null;

  // Helper to determine season in Peru/Southern Hemisphere
  const getCurrentSeason = () => {
    const month = new Date().getMonth(); // 0 = Jan, 4 = May, 11 = Dec
    if (month === 11 || month === 0 || month === 1) return "verano"; // Dec, Jan, Feb
    if (month === 2 || month === 3 || month === 4) return "otoño"; // Mar, Apr, May
    if (month === 5 || month === 6 || month === 7) return "invierno"; // Jun, Jul, Aug
    return "primavera"; // Sep, Oct, Nov
  };

  // --- AUTO GRADING LOGIC ---
  const autoGrade = (item: ItemMMSE, value: string): { correcto: boolean; puntaje: 0 | 1; base64Image?: string } => {
    const textNorm = normalizeString(value);
    const name = item.texto_item.toLowerCase();

    const compareFlexible = (userAns: string, correctAns: string): boolean => {
      const u = normalizeString(userAns);
      const c = normalizeString(correctAns);
      return u === c || (u.length >= 3 && c.length >= 3 && (u.includes(c) || c.includes(u)));
    };

    // 1. Year
    if (name.includes("año") || name.includes("ano")) {
      const correctYear = orientacionEspacial?.anio 
        ? orientacionEspacial.anio.trim()
        : new Date().getFullYear().toString();
      const isCorrect = compareFlexible(value, correctYear);
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    
    // 2. Month
    if (name.includes("mes")) {
      const correctMonth = orientacionEspacial?.mes
        ? orientacionEspacial.mes.trim()
        : (() => {
            const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            return months[new Date().getMonth()];
          })();
      const isCorrect = compareFlexible(value, correctMonth);
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    
    // 3. Date (day of month)
    if (name.includes("fecha") || name.includes("día del mes") || name.includes("dia del mes")) {
      const correctDateStr = orientacionEspacial?.diaMes && orientacionEspacial?.mes && orientacionEspacial?.anio
        ? `${orientacionEspacial.diaMes} de ${orientacionEspacial.mes} de ${orientacionEspacial.anio}`
        : (() => {
            const now = new Date();
            const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            return `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
          })();
      const isCorrect = compareFlexible(value, correctDateStr);
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    
    // 4. Day of the week
    if (name.includes("día de la semana") || name.includes("dia de la semana")) {
      const correctDay = orientacionEspacial?.diaSemana
        ? orientacionEspacial.diaSemana.trim()
        : (() => {
            const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
            return days[(new Date().getDay() + 6) % 7];
          })();
      const isCorrect = compareFlexible(value, correctDay);
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    
    // 5. Season
    if (name.includes("estación") || name.includes("estacion")) {
      const correctSeason = orientacionEspacial?.estacion
        ? orientacionEspacial.estacion.trim()
        : getCurrentSeason();
      const isCorrect = compareFlexible(value, correctSeason);
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }

    // 6. Spatial orientation (País, Departamento, Ciudad, Lugar, Piso)
    // Compare against the correct answers collected in the pre-test setup
    if (name.includes("país") || name.includes("pais")) {
      const correct = orientacionEspacial?.pais || "Perú";
      const isCorrect = compareFlexible(value, correct);
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    if (name.includes("departamento") || name.includes("provincia") || name.includes("estado")) {
      const correct = orientacionEspacial?.departamento || "";
      const isCorrect = correct ? compareFlexible(value, correct) : textNorm.length >= 2;
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    if (name.includes("ciudad") || name.includes("municipio") || name.includes("distrito")) {
      const correct = orientacionEspacial?.ciudad || "";
      const isCorrect = correct ? compareFlexible(value, correct) : textNorm.length >= 2;
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    if (name.includes("lugar") || name.includes("institución") || name.includes("institucion") || name.includes("establecimiento")) {
      const correct = orientacionEspacial?.lugar || "";
      const isCorrect = correct ? compareFlexible(value, correct) : textNorm.length >= 2;
      return { correcto: isCorrect, puntaje: isCorrect ? 1 : 0 };
    }
    if (name.includes("piso") || name.includes("área") || name.includes("area") ||
        name.includes("sala") || name.includes("ubicación") || name.includes("ubicacion")) {
      const correct = orientacionEspacial?.piso || "";
      const isCorrect = correct ? compareFlexible(value, correct) : textNorm.length >= 2;
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
      if (value === "audio_recorded") {
        return { correcto: true, puntaje: 1 };
      }
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

  // --- COUNTDOWN EYE TEST LOGIC (Lectura y Acción) ---
  const startEyeTestCountdown = () => {
    if (isEyeTestCounting) return;
    
    // Play starting beep
    playBeep(800, 0.25);
    
    setIsEyeTestCounting(true);
    setEyeTestCountdown(5);
    
    let currentCount = 5;
    
    if (eyeTestIntervalRef.current) {
      clearInterval(eyeTestIntervalRef.current);
    }
    
    eyeTestIntervalRef.current = setInterval(() => {
      currentCount -= 1;
      setEyeTestCountdown(currentCount);
      
      if (currentCount <= 0) {
        if (eyeTestIntervalRef.current) {
          clearInterval(eyeTestIntervalRef.current);
          eyeTestIntervalRef.current = null;
        }
        
        // Play final completion beep
        playBeep(1200, 0.4);
        
        setIsEyeTestCounting(false);
        saveItemAnswer("completed");
        
        // Automatically transition to the next step
        setTimeout(() => {
          handleNextStep();
        }, 3500);
      }
    }, 1000);
  };

  // --- PAPER FOLDING LOGIC ---
  const pickUpPaper = () => {
    setIsPaperPickedUp(true);
  };

  const foldPaper = () => {
    setIsPaperFolded(true);
  };

  const putPaperOnFloor = () => {
    setIsPaperOnFloor(true);
  };

  const startDragging = (e: React.DragEvent) => {
    e.dataTransfer?.setData("text/plain", "paper");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPaperOnFloor(true);
  };

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
      let val = value;
      const name = currentStep.item.texto_item.toLowerCase();
      
      if (name.includes("escritura")) {
        // Bloquear números y símbolos (sólo letras, espacios y puntuación básica)
        val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,;:¿?¡!'-]/g, "");
      } else if (name.includes("deletreo") || name.includes("posición") || name.includes("posicion")) {
        // Bloquear todo excepto una letra para el deletreo inverso
        val = val.replace(/[^a-zA-ZñÑ]/g, "").slice(0, 1);
      } else if (name.includes("nombramiento")) {
        // Bloquear números y símbolos para nombramiento de objetos
        val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s-]/g, "");
      } else if (name.includes("cálculo") || name.includes("calculo")) {
        // Bloquear todo excepto números
        val = val.replace(/[^0-9]/g, "");
      }

      const graded = autoGrade(currentStep.item, val);
      const newAnswer = {
        value: val,
        correcto: graded.correcto,
        puntaje: graded.puntaje,
        base64Image: graded.base64Image
      };
      answersRef.current[currentStep.item.id_item] = newAnswer;
      setAnswers(prev => ({
        ...prev,
        [currentStep.item.id_item]: newAnswer
      }));
    }
  };

  const saveItemAnswerForId = (idItem: number, item: ItemMMSE, value: string) => {
    let val = value;
    const name = item.texto_item.toLowerCase();

    if (name.includes("cálculo") || name.includes("calculo")) {
      // Bloquear todo excepto números para restas
      val = val.replace(/[^0-9]/g, "");
    } else if (name.includes("palabra") || name.includes("recuerdo")) {
      // Bloquear números y símbolos para el recuerdo diferido
      val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
    }

    const graded = autoGrade(item, val);
    const newAnswer = {
      value: val,
      correcto: graded.correcto,
      puntaje: graded.puntaje
    };
    answersRef.current[idItem] = newAnswer;
    setAnswers(prev => ({
      ...prev,
      [idItem]: newAnswer
    }));
  };

  const handleNextStep = async () => {
    setError(null);

    // If it is the serial subtractions (restas seriadas)
    if (currentStep.type === "restas_seriadas") {
      const items = currentStep.items;
      const allAnswered = items.every((it: any) => {
        const ans = answersRef.current[it.id_item];
        return ans !== undefined && ans.value.trim() !== "";
      });
      if (!allAnswered) {
        setError("Por favor, responda todos los cálculos antes de continuar.");
        return;
      }

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
        for (const it of items) {
          const ans = answersRef.current[it.id_item];
          const grade = autoGrade(it, ans.value);
          
          const respPayload: RespuestaItemPayload = {
            id_eval_seccion: idEvalSeccion,
            id_opcion: currentStep.opcion.id_opcion,
            id_item: it.id_item,
            respuesta_texto: ans.value,
            correcto: grade.correcto,
            puntaje: grade.puntaje
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
      
      // Go to next step
      if (currentStepIdx < steps.length - 1) {
        setCurrentStepIdx(currentStepIdx + 1);
      } else {
        // Finished all steps
        const tiempos = {
          total: elapsedSeconds
        };
        onFinalizar(tiempos);
      }
      return;
    }

    // If it is the delayed recall (recuerdo diferido)
    if (currentStep.type === "recuerdo_diferido") {
      const items = currentStep.items;
      const allAnswered = items.every((it: any) => {
        const ans = answersRef.current[it.id_item];
        return ans !== undefined && ans.value.trim() !== "";
      });
      if (!allAnswered) {
        setError("Por favor, intente recordar las 3 palabras antes de continuar.");
        return;
      }

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

        // 2. Grade recall with order-independent word matching
        const targetWords = ["peseta", "caballo", "manzana"];
        const userInputs = items.map((it: any) => {
          const val = answersRef.current[it.id_item]?.value || "";
          return val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        });

        const matchedWords = new Set<string>();
        userInputs.forEach((input: string) => {
          targetWords.forEach(word => {
            if (input.includes(word)) {
              matchedWords.add(word);
            }
          });
        });

        const matches = matchedWords.size;
        const customGrades: Record<number, { correcto: boolean; puntaje: 0 | 1 }> = {};
        items.forEach((it: any, idx: number) => {
          const correct = idx < matches;
          customGrades[it.id_item] = {
            correcto: correct,
            puntaje: correct ? 1 : 0
          };
        });

        // 3. Save Item Responses
        for (const it of items) {
          const ans = answersRef.current[it.id_item];
          const grade = customGrades[it.id_item];
          
          const respPayload: RespuestaItemPayload = {
            id_eval_seccion: idEvalSeccion,
            id_opcion: currentStep.opcion.id_opcion,
            id_item: it.id_item,
            respuesta_texto: ans.value,
            correcto: grade.correcto,
            puntaje: grade.puntaje
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
      
      // Go to next step
      if (currentStepIdx < steps.length - 1) {
        setCurrentStepIdx(currentStepIdx + 1);
      } else {
        const tiempos = {
          total: elapsedSeconds
        };
        onFinalizar(tiempos);
      }
      return;
    }

    // If it is the paper folding task (Orden de tres pasos)
    if (currentStep.type === "orden_tres_pasos") {
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
        const items = currentStep.items;
        const results = [
          { val: isPaperPickedUp ? "completed" : "incomplete", ok: isPaperPickedUp },
          { val: isPaperFolded ? "completed" : "incomplete", ok: isPaperFolded },
          { val: isPaperOnFloor ? "completed" : "incomplete", ok: isPaperOnFloor },
        ];

        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const res = results[i] || { val: "incomplete", ok: false };
          
          answersRef.current[it.id_item] = {
            value: res.val,
            correcto: res.ok,
            puntaje: res.ok ? 1 : 0
          };
          setAnswers(prev => ({
            ...prev,
            [it.id_item]: {
              value: res.val,
              correcto: res.ok,
              puntaje: res.ok ? 1 : 0
            }
          }));

          const respPayload: RespuestaItemPayload = {
            id_eval_seccion: idEvalSeccion,
            id_opcion: currentStep.opcion.id_opcion,
            id_item: it.id_item,
            respuesta_texto: res.val,
            correcto: res.ok,
            puntaje: res.ok ? 1 : 0
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
      
      // Go to next step
      if (currentStepIdx < steps.length - 1) {
        setCurrentStepIdx(currentStepIdx + 1);
      } else {
        // Finished all steps
        const tiempos = {
          total: elapsedSeconds
        };
        onFinalizar(tiempos);
      }
      return;
    }

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
    const currentAns = answersRef.current[currentItem.id_item];
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
            const val = answersRef.current[it.id_item]?.value || "";
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
          const ans = answersRef.current[it.id_item];
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
      const tiempos = {
        total: elapsedSeconds
      };
      onFinalizar(tiempos);
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

  const renderInputArea = () => {


    if (currentStep.type === "atencion_choice") {
      return (
        <div className="grid grid-cols-1 gap-4 mt-4 max-w-md mx-auto w-full animate-in fade-in duration-300">
          {currentStep.seccion.opciones.map((opc: OpcionMMSE) => (
            <button
              key={opc.id_opcion}
              onClick={() => setSelectedAtencionOpcionId(opc.id_opcion)}
              className={`p-6 text-left rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col justify-between shadow-sm duration-300 ${
                selectedAtencionOpcionId === opc.id_opcion
                  ? "border-indigo-500 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 shadow-md shadow-indigo-500/10 text-indigo-900"
                  : "border-slate-200/80 bg-white/80 hover:border-slate-350 hover:bg-slate-50/50 text-slate-800"
              }`}
            >
              <span className="font-extrabold text-lg flex items-center gap-2">
                {selectedAtencionOpcionId === opc.id_opcion && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                )}
                {opc.nombre_opcion}
              </span>
              <span className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed">
                {opc.nombre_opcion.toLowerCase().includes("restas") 
                  ? "Cálculos matemáticos progresivos restando de 7 en 7 desde 100." 
                  : "Deletrear la palabra MUNDO y luego ingresarla de atrás hacia adelante."}
              </span>
            </button>
          ))}
        </div>
      );
    }

    if (currentStep.type === "fijacion_instruction") {
      return (
        <div className="flex flex-col items-center mt-6 space-y-8 animate-in fade-in duration-500 w-full">
          <div className="flex justify-center gap-4 flex-wrap w-full">
            {["PESETA", "CABALLO", "MANZANA"].map((w, idx) => (
              <div 
                key={idx} 
                className="bg-gradient-to-b from-white to-slate-50/60 border border-slate-200/80 shadow-md hover:shadow-xl hover:scale-[1.04] px-8 py-6 rounded-2xl flex flex-col items-center min-w-[145px] transition-all duration-300 relative overflow-hidden group flex-1"
              >
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Palabra {idx+1}</span>
                <span className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{w}</span>
              </div>
            ))}
          </div>
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex gap-3 text-amber-900 max-w-lg shadow-sm">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <p className="text-xs font-bold leading-relaxed text-left">
              Léalas en voz alta y memorícelas con atención. Cuando se sienta listo para continuar e ingresarlas, presione el botón de Siguiente abajo.
            </p>
          </div>
        </div>
      );
    }

    // Paper folding task render (Orden de tres pasos)
    if (currentStep.type === "orden_tres_pasos") {
      return (
        <div className="flex flex-col items-center mt-6 space-y-8 animate-in zoom-in-95 duration-400 w-full">
          <div className="w-full max-w-md bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Actividad Interactiva del Papel</h4>
            
            <div className="flex flex-col space-y-2 text-left text-xs font-semibold text-slate-500">
              <div className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-300 ${
                isPaperPickedUp ? "bg-emerald-50/90 border-emerald-250 text-emerald-900 shadow-sm" : "bg-white/80 border-slate-200"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isPaperPickedUp ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-450"
                }`}>
                  <Check size={11} strokeWidth={3} />
                </div>
                <span className={isPaperPickedUp ? "line-through opacity-70" : ""}>1. Toma el papel con tu mano</span>
              </div>

              <div className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-300 ${
                isPaperFolded ? "bg-emerald-50/90 border-emerald-250 text-emerald-900 shadow-sm" : "bg-white/80 border-slate-200"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isPaperFolded ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-450"
                }`}>
                  <Check size={11} strokeWidth={3} />
                </div>
                <span className={isPaperFolded ? "line-through opacity-70" : ""}>2. Dobla el papel por la mitad</span>
              </div>

              <div className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-300 ${
                isPaperOnFloor ? "bg-emerald-50/90 border-emerald-250 text-emerald-900 shadow-sm" : "bg-white/80 border-slate-200"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isPaperOnFloor ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-slate-100 text-slate-450"
                }`}>
                  <Check size={11} strokeWidth={3} />
                </div>
                <span className={isPaperOnFloor ? "line-through opacity-70" : ""}>3. Suelta el papel doblado en el suelo</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
            {/* The Paper Component */}
            {!isPaperOnFloor && (
              <div
                draggable={isPaperPickedUp}
                onDragStart={startDragging}
                onClick={() => {
                  if (!isPaperPickedUp) pickUpPaper();
                }}
                className={`transition-all duration-500 cursor-pointer shadow-md select-none flex items-center justify-center font-bold text-slate-700 bg-[#fcfcf1] border border-slate-300 relative overflow-hidden ${
                  isPaperFolded 
                    ? "w-28 h-40 border-l-4 border-l-slate-300/50 shadow-inner" 
                    : isPaperPickedUp
                      ? "w-56 h-40 ring-4 ring-indigo-500/30 scale-[1.02] border-indigo-300"
                      : "w-56 h-40 hover:scale-[1.01] hover:border-slate-400"
                }`}
              >
                {/* Visual Crease Line if folded */}
                {isPaperFolded && (
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-slate-300/40 border-r border-r-white/40" />
                )}
                <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                  <span className="text-sm font-black tracking-tight uppercase">Papel</span>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                    {!isPaperPickedUp 
                      ? "Haz clic para tomar" 
                      : isPaperFolded 
                        ? "Doblado - Arrastra al suelo" 
                        : "Arrastrame o doblame"}
                  </span>
                </div>
              </div>
            )}

            {/* Fold Button */}
            {isPaperPickedUp && !isPaperFolded && (
              <button
                onClick={foldPaper}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <BookOpen size={14} /> Doblar papel por la mitad
              </button>
            )}

            {/* The Floor Dropzone */}
            {isPaperFolded && (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => {
                  if (isPaperFolded && !isPaperOnFloor) putPaperOnFloor();
                }}
                className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-300 cursor-pointer ${
                  isPaperOnFloor 
                    ? "bg-slate-100/50 border-slate-300" 
                    : "bg-slate-50/30 border-slate-300 hover:bg-slate-50/70 hover:border-slate-400 text-slate-500 animate-pulse"
                }`}
              >
                {isPaperOnFloor ? (
                  <div className="flex flex-col items-center gap-1.5 animate-in zoom-in-90 duration-300">
                    {/* Folded Paper on the floor */}
                    <div className="w-16 h-24 bg-[#eeeee3] border border-slate-300/90 border-l-4 border-l-slate-350/50 shadow-inner flex items-center justify-center relative rotate-6">
                      <div className="absolute inset-y-0 left-0 w-0.5 bg-slate-400/20" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Papel</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">¡Papel en el suelo!</span>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Suelo</p>
                    <p className="text-[10px] font-bold text-slate-400">Arrastra el papel doblado aquí o haz clic para soltarlo</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentStep.type === "restas_seriadas") {
      return (
        <div className="flex flex-col gap-5 mt-4 max-w-md mx-auto w-full animate-in fade-in duration-300">
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest text-center">
            Reste de 7 en 7 de forma progresiva desde 100
          </p>
          <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
            {currentStep.items.map((it: any, idx: number) => {
              const ansVal = answers[it.id_item]?.value || "";
              return (
                <div key={it.id_item} className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-700 flex-1 text-left">
                    {idx + 1}. {it.texto_item}:
                  </span>
                  <input
                    ref={(el) => { subtractionRefs.current[idx] = el; }}
                    type="number"
                    placeholder="Resultado..."
                    value={ansVal}
                    onChange={(e) => saveItemAnswerForId(it.id_item, it, e.target.value)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (idx < currentStep.items.length - 1) {
                          subtractionRefs.current[idx + 1]?.focus();
                        } else {
                          handleNextStep();
                        }
                      }
                    }}
                    className="w-32 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-center font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white transition-all shadow-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Delayed Recall (Recuerdo Diferido) — 3 word inputs with clear context
    if (currentStep.type === "recuerdo_diferido") {
      const wordLabels = ["Primera palabra", "Segunda palabra", "Tercera palabra"];
      return (
        <div className="flex flex-col gap-5 mt-4 max-w-md mx-auto w-full animate-in fade-in duration-400">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex gap-3 text-amber-900 shadow-sm">
            <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <p className="text-xs font-bold leading-relaxed text-left">
              Intente recordar las <span className="font-black text-amber-950">3 palabras</span> que memorizó al inicio de la prueba. Escríbalas a continuación.
            </p>
          </div>
          <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
            {currentStep.items.map((it: any, idx: number) => {
              const ansVal = answers[it.id_item]?.value || "";
              return (
                <div key={it.id_item} className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm shadow-indigo-500/20 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-bold text-slate-600">
                      {wordLabels[idx] || `Palabra ${idx + 1}`}
                    </span>
                  </div>
                  <input
                    ref={(el) => { recallRefs.current[idx] = el; }}
                    type="text"
                    placeholder="Escriba la palabra..."
                    value={ansVal}
                    onChange={(e) => saveItemAnswerForId(it.id_item, it, e.target.value)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (idx < currentStep.items.length - 1) {
                          recallRefs.current[idx + 1]?.focus();
                        } else {
                          handleNextStep();
                        }
                      }
                    }}
                    className="w-44 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-center font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white transition-all shadow-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const item = currentStep.item;
    const ansValue = answers[item.id_item]?.value || "";
    const lowerName = item.texto_item.toLowerCase();

    // 1. Unified Grid Choices for Orientation (Temporal + Spatial)
    const isOrientationChoice = 
      lowerName.includes("año") || lowerName.includes("ano") ||
      lowerName.includes("estación") || lowerName.includes("estacion") ||
      lowerName.includes("mes") ||
      lowerName.includes("fecha") || lowerName.includes("día del mes") || lowerName.includes("dia del mes") ||
      lowerName.includes("día de la semana") || lowerName.includes("dia de la semana") ||
      lowerName.includes("país") || lowerName.includes("pais") ||
      lowerName.includes("departamento") || lowerName.includes("provincia") || lowerName.includes("estado") ||
      lowerName.includes("ciudad") || lowerName.includes("municipio") ||
      lowerName.includes("lugar") || lowerName.includes("institución") || lowerName.includes("institucion") ||
      lowerName.includes("piso") || lowerName.includes("área") || lowerName.includes("area") ||
      lowerName.includes("ubicación") || lowerName.includes("ubicacion");

    if (isOrientationChoice && shuffledChoices.length > 0) {
      const isDate = lowerName.includes("fecha") || lowerName.includes("día del mes") || lowerName.includes("dia del mes");
      const isSpatial = lowerName.includes("país") || lowerName.includes("pais") ||
        lowerName.includes("departamento") || lowerName.includes("provincia") || lowerName.includes("estado") ||
        lowerName.includes("ciudad") || lowerName.includes("municipio") ||
        lowerName.includes("lugar") || lowerName.includes("institución") || lowerName.includes("institucion") ||
        lowerName.includes("piso") || lowerName.includes("área") || lowerName.includes("area") ||
        lowerName.includes("ubicación") || lowerName.includes("ubicacion");
      const gridCols = isDate ? "grid-cols-1 max-w-md" : isSpatial ? "grid-cols-2 max-w-lg" : "grid-cols-2 max-w-sm";
      return (
        <div className={`grid ${gridCols} gap-4 mt-4 mx-auto w-full animate-in fade-in duration-300`}>
          {shuffledChoices.map((choice) => (
            <button
              key={choice}
              onClick={() => {
                saveItemAnswer(choice);
                setTimeout(() => handleNextStep(), 350);
              }}
              className={`py-4 px-6 rounded-2xl font-bold border transition-all text-sm cursor-pointer shadow-sm active:scale-95 duration-200 ${
                ansValue === choice
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                  : "bg-white/80 border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      );
    }

    // 2. Object Illustration for Naming (Reloj / Lápiz)
    if (lowerName.includes("nombramiento")) {
      const isWatch = lowerName.includes("objeto 1") || lowerName.includes("reloj");
      return (
        <div className="flex flex-col items-center mt-4 space-y-5 animate-in fade-in duration-300 w-full">
          <div className="w-44 h-44 bg-white rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center p-4">
            {isWatch ? (
              <img src={RelojImage} alt="Reloj" className="w-36 h-36 object-contain" />
            ) : (
              <img src={LapizImage} alt="Lápiz" className="w-36 h-36 object-contain" />
            )}
          </div>
          <input
            type="text"
            placeholder="¿Qué es este objeto?"
            value={ansValue}
            onChange={(e) => saveItemAnswer(e.target.value)}
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && ansValue.trim() !== '') {
                handleNextStep();
              }
            }}
            className="w-full max-w-sm px-5 py-4 border-2 border-slate-200 rounded-2xl text-center outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white font-semibold text-lg transition-all shadow-sm"
            autoFocus
          />
        </div>
      );
    }

    // 3. Deletreo inverso slots (OTP letters)
    if (lowerName.includes("deletreo") || lowerName.includes("posición") || lowerName.includes("posicion")) {
      const idxStr = lowerName.includes("primera") ? "1ra" : 
                     lowerName.includes("segunda") ? "2da" :
                     lowerName.includes("tercera") ? "3ra" :
                     lowerName.includes("cuarta") ? "4ta" : "5ta";
      return (
        <div className="flex flex-col items-center mt-4 space-y-5 w-full">
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">M-U-N-D-O deletreado al revés</p>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-sm font-bold text-slate-600">Escriba la {idxStr} letra:</span>
            <input
              type="text"
              maxLength={1}
              value={ansValue}
              onChange={(e) => saveItemAnswer(e.target.value)}
              onCopy={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && ansValue.trim() !== '') {
                  handleNextStep();
                }
              }}
              className="w-14 h-16 border-2 border-slate-200 rounded-2xl text-center font-black text-2xl text-indigo-650 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white shadow-sm"
              autoFocus
            />
          </div>
        </div>
      );
    }

    // 7. Interactive Hold eyes close
    if (lowerName.includes("lee y ejecuta") || lowerName.includes("lectura")) {
      const ringProgress = (eyeTestCountdown / 5) * 100;
      return (
        <div className="flex flex-col items-center mt-6 space-y-6 w-full animate-in fade-in duration-300">
          <p className={`font-black uppercase tracking-wider text-center transition-all duration-300 ${
            eyeTestCountdown === 0 
              ? "text-4xl text-emerald-600 animate-bounce" 
              : "text-3xl text-slate-800"
          }`}>
            {eyeTestCountdown === 0 ? "ABRA LOS OJOS AHORA" : "CIERRE LOS OJOS AHORA"}
          </p>
          <div className="rounded-2xl bg-slate-50 border border-slate-150 p-5 max-w-md w-full shadow-sm">
            <p className="text-base text-slate-700 font-bold text-center leading-relaxed">
              {eyeTestCountdown === 0
                ? "¡Prueba completada con éxito! Ya puede abrir los ojos."
                : isEyeTestCounting 
                  ? "Escuchará un tono cuando se cumpla el tiempo. Mantenga los ojos cerrados." 
                  : "Presione Iniciar, cierre los ojos inmediatamente y manténgalos cerrados hasta escuchar el tono final."}
            </p>
          </div>
          
          <div className="relative flex items-center justify-center mt-4">
            {/* Countdown progress ring */}
            <svg className="w-36 h-36 transform -rotate-90 drop-shadow-sm">
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="#f1f5f9"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="url(#countdown-gradient)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - (isEyeTestCounting ? ringProgress : 100) / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Button or Display */}
            {isEyeTestCounting ? (
              <div className="absolute w-28 h-28 rounded-full bg-slate-50 border border-slate-200 flex flex-col items-center justify-center select-none shadow-inner animate-pulse">
                <span className="text-4xl font-black text-indigo-600">{eyeTestCountdown}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 mt-1">Segundos</span>
              </div>
            ) : eyeTestCountdown === 0 ? (
              <div className="absolute w-28 h-28 rounded-full bg-emerald-50 border border-emerald-250 flex flex-col items-center justify-center select-none shadow-inner animate-in zoom-in duration-300">
                <Check className="w-12 h-12 text-emerald-600 animate-bounce" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-1">¡Listo!</span>
              </div>
            ) : (
              <button
                onClick={startEyeTestCountdown}
                className="absolute w-28 h-28 rounded-full flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-300 bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
              >
                <Eye className="w-9 h-9 mb-1 text-white group-hover:animate-bounce" />
                <span className="text-xs font-black uppercase tracking-wider">Iniciar</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    // 8. Drawing Canvas (Pentagons Copy)
    if (lowerName.includes("dibujo") || lowerName.includes("figura") || lowerName.includes("copia de dibujo")) {
      return (
        <div className="flex flex-col items-center mt-4 space-y-5 animate-in fade-in duration-400 w-full">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center max-w-sm w-full">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dibujo de Referencia</span>
            <svg width="200" height="110" viewBox="0 0 200 110" className="text-slate-800 drop-shadow-sm">
              <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="currentColor" strokeWidth="3" />
              <polygon points="120,30 160,30 175,75 135,105 105,75" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>

          <div className="relative bg-white border-2 border-slate-200/85 rounded-2xl overflow-hidden shadow-sm w-full max-w-md">
            <div className="absolute top-2.5 left-2.5 z-10 bg-slate-800/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-450 animate-ping" />
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
            
            <button
              onClick={clearCanvas}
              className="absolute bottom-2.5 right-2.5 px-3 py-2 bg-slate-100/90 hover:bg-slate-200 hover:text-slate-850 text-slate-650 rounded-xl text-[11px] font-black transition-all shadow-sm border border-slate-200/80 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={12} /> Limpiar lienzo
            </button>
          </div>
        </div>
      );
    }

    if (lowerName.includes("repetición") || lowerName.includes("repeticion")) {
      const formatDuration = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
      };

      return (
        <div className="flex flex-col items-center mt-6 space-y-6 w-full animate-in fade-in duration-300">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-sm text-center">
            {isRecording ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 animate-ping absolute" />
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="text-sm font-black text-red-600 uppercase tracking-wider">Grabando Voz</span>
                <span className="font-mono text-2xl font-black text-slate-700">{formatDuration(recordingDuration)}</span>
              </div>
            ) : audioUrl ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-6 h-6" strokeWidth={3} />
                </div>
                <div>
                  <span className="text-sm font-black text-emerald-600 uppercase tracking-wider block">¡Voz Grabada!</span>
                  <span className="text-xs text-slate-450 font-bold mt-1 block">Puede reproducir para escuchar o descartar</span>
                </div>
                
                <div className="flex justify-center gap-3 w-full mt-2">
                  <button
                    type="button"
                    onClick={playAudio}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Play size={12} /> Reproducir
                  </button>
                  <button
                    type="button"
                    onClick={discardRecording}
                    className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black border border-red-200/80 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Trash2 size={12} /> Descartar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Mic className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-black text-slate-700 uppercase tracking-wider block">Repetición Oral</span>
                  <span className="text-[11px] text-slate-400 font-bold mt-1 block">Haga clic abajo para iniciar y repita la frase</span>
                </div>
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Mic size={16} /> Iniciar grabación
                </button>
              </div>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="w-full mt-4 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 animate-pulse"
              >
                <Square size={12} /> Detener y guardar
              </button>
            )}
          </div>
        </div>
      );
    }

    // 9. Standard Text / Number Inputs
    const isNum = item.tipo_respuesta === "numero" || lowerName.includes("año") || lowerName.includes("fecha") || lowerName.includes("cálculo") || lowerName.includes("calculo");
    return (
      <div className="mt-4 max-w-sm mx-auto w-full">
        <input
          type={isNum ? "number" : "text"}
          placeholder={isNum ? "Ingrese el número..." : "Escriba su respuesta..."}
          value={ansValue}
          onChange={(e) => saveItemAnswer(e.target.value)}
          onCopy={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && ansValue.trim() !== '') {
              handleNextStep();
            }
          }}
          className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-center outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white font-semibold text-lg transition-all shadow-sm"
          autoFocus
        />
      </div>
    );
  };

  const remainingSeconds = tiempoLimite ? tiempoLimite - elapsedSeconds : null;
  const isTimeCritical = remainingSeconds !== null && remainingSeconds <= 60;
  const displaySeconds = tiempoLimite ? Math.max(0, tiempoLimite - elapsedSeconds) : elapsedSeconds;
  
  const progressPercent = steps.length > 0 ? (currentStepIdx / steps.length) * 100 : 0;
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === steps.length - 1;

  // Background and UI structures matching Web Application development guidelines (Wowing Aesthetics)
  return (
    <div className="bg-white border border-slate-200 max-w-xl w-full rounded-3xl shadow-xl p-6 sm:p-10 transition-all duration-300 relative overflow-hidden">
      {/* Decorative top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-md" />
      
      {/* Dynamic stepped tracker */}
      <div className="space-y-3 mb-8">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider flex items-center gap-1.5 font-bold text-slate-500">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            {currentStep.categoria?.nombre_categoria || "Prueba cognitiva"}
          </span>
          <span className={`font-mono px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm border transition-all duration-300 font-bold ${
            isTimeCritical 
              ? "bg-red-500 text-white border-red-500 animate-pulse scale-105" 
              : "text-slate-650 bg-slate-50 border-slate-200/70"
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isTimeCritical ? "text-white" : "text-indigo-600"}`} />
            {formatTime(displaySeconds)}
          </span>
          <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-slate-100/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
          <div 
            style={{ width: `${progressPercent}%` }} 
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/10 relative"
          >
            <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/30 animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* Main question card */}
      <div className="text-center py-4 space-y-4">
        {(currentStep.type === "item" || currentStep.type === "recuerdo_diferido") && (
          <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100/50">
            {currentStep.seccion.nombre_seccion} 
            {currentStep.type === "item" && currentStep.totalItemsInSection > 1 && ` (${currentStep.idxInSection + 1}/${currentStep.totalItemsInSection})`}
          </span>
        )}
        
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight" style={{ textWrap: 'pretty' }}>
          {currentStep.type === "recuerdo_diferido" ? (
            currentStep.texto_pregunta
          ) : currentStep.type === "item" ? (
            (() => {
              const name = currentStep.item.texto_item.toLowerCase();
              if (name.includes("repetición") || name.includes("repeticion")) {
                return "Repita la frase en voz alta: 'En un trigal había cinco perros'";
              }
              if (name.includes("escritura")) {
                return "Escriba una oración completa y coherente (que tenga sentido, sujeto y verbo):";
              }
              // Friendly question mapping for temporal orientation
              if (name === "año" || name === "ano") {
                return "¿En qué año estamos?";
              }
              if (name.includes("estación") || name.includes("estacion")) {
                return "¿En qué estación del año estamos?";
              }
              if (name === "mes") {
                return "¿En qué mes estamos?";
              }
              if (name.includes("fecha") || name.includes("día del mes") || name.includes("dia del mes")) {
                return "¿Qué fecha es hoy? (Día del mes)";
              }
              if (name.includes("día de la semana") || name.includes("dia de la semana")) {
                return "¿Qué día de la semana es hoy?";
              }
              // Friendly question mapping for spatial orientation
              if (name === "país" || name === "pais") {
                return "¿En qué país estamos?";
              }
              if (name.includes("departamento") || name.includes("provincia") || name.includes("estado")) {
                return "¿En qué departamento, provincia o estado nos encontramos?";
              }
              if (name.includes("ciudad") || name.includes("municipio") || name.includes("distrito")) {
                return "¿En qué ciudad o distrito estamos?";
              }
              if (name.includes("lugar") || name.includes("institución") || name.includes("institucion") || name.includes("establecimiento")) {
                return "¿En qué establecimiento o lugar nos encontramos?";
              }
              if (name.includes("piso") || name.includes("área") || name.includes("area") || name.includes("sala") || name.includes("ubicación") || name.includes("ubicacion")) {
                return "¿En qué piso, sala o área de este lugar estamos?";
              }
              return currentStep.item.texto_item;
            })()
          ) : currentStep.texto_pregunta}
        </h2>
        
        {currentStep.type === "item" && currentStep.item.criterio_correccion && 
         !currentStep.item.texto_item.toLowerCase().includes("repetición") && 
         !currentStep.item.texto_item.toLowerCase().includes("repeticion") && 
         !currentStep.item.texto_item.toLowerCase().includes("escritura") && (
          <p className="text-xs text-slate-400 font-semibold italic mt-2 px-4 leading-normal">
            {currentStep.item.criterio_correccion}
          </p>
        )}
      </div>

      {/* Dynamic input area */}
      <div className="py-2 min-h-[160px] flex items-center justify-center">
        {renderInputArea()}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-6 bg-red-50/70 backdrop-blur-sm border border-red-200/80 rounded-2xl p-4 flex gap-3 text-red-800 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-end gap-4">
        <button
          onClick={handleNextStep}
          disabled={saving}
          className="px-8 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
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
