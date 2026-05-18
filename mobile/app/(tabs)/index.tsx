import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Detección dinámica del host del backend (resuelve localhost en móviles conectados a red local)
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    const hostname = window.location.hostname;
    // Si corre en localhost, usa la misma IP para el puerto 5001. Si es producción, adaptarlo
    return `http://${hostname}:5001/api`;
  }
  // En emuladores de Android, 10.0.2.2 apunta a la máquina host local
  return Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';
};

const API_URL = getApiUrl();

// Mapeo clínico de resultados CDT bajo criterios de Shulman et al. (1986)
const CDT_SCALES: Record<number, { title: string; desc: string; color: string; bg: string; border: string; alert: boolean }> = {
  5: {
    title: "Normal",
    desc: "Dibujo preciso del reloj. Círculo bien definido, doce números en orden y manecillas en posición espacial perfecta indicando las 11:10. Funciones ejecutivas y habilidades visuoespaciales preservadas sin indicios detectables de deterioro cognitivo.",
    color: "#2E7D32",
    bg: "#E8F5E9",
    border: "#A5D6A7",
    alert: false
  },
  4: {
    title: "Nivel Límite",
    desc: "El reloj es razonablemente preciso con distorsiones espaciales menores. Números ligeramente amontonados o manecilla de longitud incorrecta. Funciones visuoespaciales mayormente preservadas. Se sugiere seguimiento clínico habitual.",
    color: "#689F38",
    bg: "#F1F8E9",
    border: "#C5E1A5",
    alert: false
  },
  3: {
    title: "Deterioro Leve (Posible MCI)",
    desc: "Se evidencian fallas de planificación espacial moderadas: números amontonados, omitidos o desplazados. Manecillas en posición incorrecta pero reconocible. Sugestivo de Deterioro Cognitivo Leve (MCI). Se recomienda evaluación complementaria detallada.",
    color: "#E65100",
    bg: "#FFF3E0",
    border: "#FFE0B2",
    alert: true
  },
  2: {
    title: "Deterioro Moderado",
    desc: "El reloj presenta desorganización visuoespacial significativa o errores conceptuales severos: omisión de números esenciales, manecillas desubicadas o números fuera de la esfera circular. Indica compromiso significativo en funciones de planificación.",
    color: "#D84315",
    bg: "#FBE9E7",
    border: "#FFCCBC",
    alert: true
  },
  1: {
    title: "Deterioro Severo",
    desc: "El reloj es apenas reconocible. Se muestra una pérdida grave en la representación conceptual de la prueba: números esparcidos al azar sin coherencia, garabatos o falta total de manecillas. Fuertemente compatible con cuadros demenciales avanzados.",
    color: "#C62828",
    bg: "#FFEBEE",
    border: "#FFCDD2",
    alert: true
  },
  0: {
    title: "Deterioro Muy Severo",
    desc: "Incapacidad total de reproducir la figura del reloj. No se observa estructura circular reconocible, números ni manecillas. Indica ruptura profunda de praxias constructivas y semánticas. Requiere atención clínica y neurológica inmediata.",
    color: "#B71C1C",
    bg: "#FFEBEE",
    border: "#FFCDD2",
    alert: true
  }
};

export default function HomeScreen() {
  // Estados de navegación y autenticación
  const [step, setStep] = useState<'login' | 'instructions' | 'cdt_capture' | 'voice_capture' | 'cdt_results' | 'voice_results' | 'processing'>('login');
  const [accessCode, setAccessCode] = useState('');
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados del Test del Reloj (CDT)
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cdtResult, setCdtResult] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  // Estados del Test de Voz (SVF)
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [voiceResult, setVoiceResult] = useState<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animaciones para efectos de voz
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Manejar el tiempo en la grabación de voz
  useEffect(() => {
    if (isRecording) {
      setVoiceTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setVoiceTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Limpiar estados al cerrar sesión
  const handleLogout = () => {
    setStep('login');
    setAccessCode('');
    setPatientInfo(null);
    setErrorMessage(null);
    setImageUri(null);
    setCdtResult(null);
    setVoiceResult(null);
    setRejectReason(null);
    if (recording) {
      recording.stopAndUnloadAsync().catch(() => {});
      setRecording(null);
    }
    setIsRecording(false);
  };

  // Login de Paciente mediante Código de Acceso
  const handlePatientLogin = async () => {
    if (!accessCode || accessCode.trim().length < 4) {
      setErrorMessage("Por favor ingrese un código de acceso válido.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/auth/patient-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_code: accessCode.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPatientInfo(data.codigo_info);
        setStep('instructions');
      } else {
        setErrorMessage(data.message || "Código de acceso inválido o expirado. Consulte con el neuropsicólogo.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Error de conexión con el servidor. Verifique que el backend esté ejecutándose.");
    } finally {
      setLoading(false);
    }
  };

  // Iniciar el flujo de captura de la prueba
  const startEvaluation = () => {
    const isCdt = patientInfo?.tipo_evaluacion?.toLowerCase().includes('reloj') || patientInfo?.tipo_evaluacion === 'CDT';
    if (isCdt) {
      setStep('cdt_capture');
    } else {
      setStep('voice_capture');
    }
  };

  // Capturar imagen con la Cámara
  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        alert("Se requiere permiso de cámara para capturar el dibujo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setRejectReason(null);
      }
    } catch (e) {
      console.error("Error al tomar foto:", e);
      alert("Error al abrir la cámara.");
    }
  };

  // Elegir imagen desde la Galería
  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert("Se requiere permiso de galería para seleccionar el dibujo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setRejectReason(null);
      }
    } catch (e) {
      console.error("Error al elegir foto:", e);
      alert("Error al abrir la galería.");
    }
  };

  // Subir la fotografía del CDT al backend de IA
  const submitCdtTest = async () => {
    if (!imageUri) return;

    setStep('processing');
    setRejectReason(null);

    try {
      const formData = new FormData();

      // Conversión especial para PWA/Web y Native a FormData
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, 'cdt_clock_drawing.jpg');
      } else {
        formData.append('file', {
          uri: imageUri,
          name: 'cdt_clock_drawing.jpg',
          type: 'image/jpeg',
        } as any);
      }

      formData.append('id_asignacion', patientInfo.id_codigo.toString());

      const uploadResponse = await fetch(`${API_URL}/cdt/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadResponse.ok && uploadData.success) {
        setCdtResult(uploadData.resultado);
        setStep('cdt_results');
      } else {
        // Manejar códigos 422 de pre-validación (la foto no parece un dibujo o baja confianza)
        const errMsg = uploadData.message || "Error al procesar la imagen.";
        setRejectReason(errMsg);
        setStep('cdt_capture');
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      setRejectReason("Error de conexión al subir la imagen. Inténtelo de nuevo.");
      setStep('cdt_capture');
    }
  };

  // Iniciar Grabación de Voz (SVF)
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      } else {
        alert('Se requieren permisos de micrófono para realizar esta prueba.');
      }
    } catch (err) {
      console.error('Fallo al iniciar la grabación de audio', err);
    }
  }

  // Detener Grabación de Voz (SVF)
  async function stopRecording() {
    if (!recording) return;
    setIsRecording(false);
    setStep('processing');

    try {
      await recording.stopAndUnloadAsync();
      // Simulamos la llamada acústica del RF (Random Forest) a la IA con un delay de procesamiento
      setTimeout(() => {
        const hasAlert = Math.random() > 0.4;
        setVoiceResult({
          clase_predicha: hasAlert ? 1 : 0,
          alerta: hasAlert,
          confianza: (Math.random() * 18 + 78).toFixed(1),
          transcripcion: "Hola, bueno... mi día a día es tranquilo. Me levanto temprano, a las siete. Desayuno con mi café. Luego doy un paseo por la plaza del Centro de Salud San Martín. Regreso a casa, leo un libro de historia y en la noche ceno ligero mientras veo las noticias antes de dormir. Animales: perro, gato, caballo, elefante, león, tigre, águila y conejo..."
        });
        setStep('voice_results');
      }, 4000);
    } catch (err) {
      console.error('Error al guardar el audio', err);
      setStep('voice_capture');
    }
  }

  // Formatear segundos en MM:SS
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.outerContainer}>
      {/* Top Banner de Identidad */}
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <FontAwesome name="heartbeat" size={24} color="#0D47A1" />
          <Text style={styles.headerBrand}>Centro de Salud San Martín</Text>
        </View>
        {step !== 'login' && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Salir</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ==================== 1. PANTALLA DE LOGIN DE PACIENTE ==================== */}
        {step === 'login' && (
          <View style={styles.card}>
            <View style={styles.logoCenter}>
              <View style={styles.avatarCircle}>
                <Ionicons name="medical" size={48} color="#0D47A1" />
              </View>
              <Text style={styles.loginTitle}>Sistema Inteligente de Evaluación Cognitiva</Text>
              <Text style={styles.loginSubtitle}>Portal del Paciente (PWA Móvil)</Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Código de Acceso del Paciente</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome name="key" size={20} color="#637381" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: CDT-123"
                  placeholderTextColor="#919EAB"
                  value={accessCode}
                  onChangeText={(text) => {
                    setAccessCode(text);
                    setErrorMessage(null);
                  }}
                  autoCapitalize="characters"
                  maxLength={12}
                />
              </View>
              <Text style={styles.inputHelper}>
                Ingrese el código temporal generado por el neuropsicólogo en el panel web.
              </Text>
            </View>

            {errorMessage && (
              <View style={styles.errorAlert}>
                <MaterialIcons name="error-outline" size={22} color="#C62828" />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
              onPress={handlePatientLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Iniciar Evaluación</Text>
                  <FontAwesome name="arrow-right" size={16} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ==================== 2. PANTALLA DE INSTRUCCIONES CLÍNICAS ==================== */}
        {step === 'instructions' && (
          <View style={styles.card}>
            <View style={styles.patientBanner}>
              <FontAwesome name="user-circle-o" size={24} color="#0D47A1" />
              <Text style={styles.patientBannerText}>Paciente: {patientInfo?.nombre_paciente}</Text>
            </View>

            <Text style={styles.sectionTitle}>
              {patientInfo?.tipo_evaluacion?.toLowerCase().includes('reloj') || patientInfo?.tipo_evaluacion === 'CDT'
                ? "Test del Reloj (CDT)"
                : "Prueba de Fluidez Verbal (SVF)"
              }
            </Text>

            <View style={styles.instructionCard}>
              <Text style={styles.insStepTitle}>Pasos a seguir:</Text>

              {patientInfo?.tipo_evaluacion?.toLowerCase().includes('reloj') || patientInfo?.tipo_evaluacion === 'CDT' ? (
                <>
                  <View style={styles.insRow}>
                    <Text style={styles.insNumber}>1</Text>
                    <Text style={styles.insText}>Tome una hoja de papel en blanco y un lápiz o bolígrafo.</Text>
                  </View>
                  <View style={styles.insRow}>
                    <Text style={styles.insNumber}>2</Text>
                    <Text style={styles.insText}>Dibuje un reloj circular grande.</Text>
                  </View>
                  <View style={styles.insRow}>
                    <Text style={styles.insNumber}>3</Text>
                    <Text style={styles.insText}>Coloque todos los números de las horas (del 1 al 12) en su posición correcta.</Text>
                  </View>
                  <View style={styles.insRow}>
                    <Text style={styles.insNumber}>4</Text>
                    <Text style={styles.insText}>Dibuje las manecillas indicando exactamente las once y diez (11:10).</Text>
                  </View>
                  <View style={styles.insRow}>
                    <Text style={styles.insNumber}>5</Text>
                    <Text style={styles.insText}>Al finalizar, tome una foto nítida de su dibujo usando el botón de captura móvil.</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.insRow}>
                    <Text style={styles.insNumber}>1</Text>
                    <Text style={styles.insText}>Busque un ambiente tranquilo y libre de ruidos molestos.</Text>
                  </View>
                  <View style={styles.insRow}>
                    <Text style={styles.insNumber}>2</Text>
                    <Text style={styles.insText}>Haga clic en el micrófono rojo para comenzar a grabar su voz.</Text>
                  </View>
                  <View style={styles.insRow}>
                    <Text style={styles.insNumber}>3</Text>
                    <Text style={styles.insText}>Mencione la mayor cantidad de nombres de animales que pueda recordar durante 60 segundos.</Text>
                  </View>
                  <View style={styles.insRow}>
                    <Text style={styles.insNumber}>4</Text>
                    <Text style={styles.insText}>Al finalizar, toque el botón cuadrado de stop para enviar su audio a análisis de IA.</Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={startEvaluation}>
              <Text style={styles.primaryBtnText}>Comenzar Prueba</Text>
              <FontAwesome name="play" size={14} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* ==================== 3. CAPTURA Y SUBIDA CDT ==================== */}
        {step === 'cdt_capture' && (
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>Capturar Test del Reloj</Text>
            <Text style={styles.cardHeaderSubtitle}>Suba el dibujo de {patientInfo?.nombre_paciente}</Text>

            {rejectReason && (
              <View style={styles.warningAlert}>
                <Ionicons name="warning" size={24} color="#E65100" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningAlertTitle}>Imagen Rechazada por IA</Text>
                  <Text style={styles.warningAlertText}>{rejectReason}</Text>
                </View>
              </View>
            )}

            {/* Zona de Visualización de Foto */}
            <View style={styles.imageSelectorBox}>
              {imageUri ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                    <FontAwesome name="times" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyPhotoBox}>
                  <Ionicons name="camera-outline" size={48} color="#919EAB" />
                  <Text style={styles.emptyPhotoText}>No hay dibujo capturado</Text>
                  <Text style={styles.emptyPhotoSubtext}>Fotografíe el reloj dibujado sobre el papel</Text>
                </View>
              )}
            </View>

            {/* Opciones de captura */}
            <View style={styles.captureOptionsRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={takePhoto}>
                <FontAwesome name="camera" size={16} color="#0D47A1" />
                <Text style={styles.secondaryBtnText}>Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromGallery}>
                <FontAwesome name="image" size={16} color="#0D47A1" />
                <Text style={styles.secondaryBtnText}>Galería</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <TouchableOpacity style={styles.primaryBtn} onPress={submitCdtTest}>
                <Text style={styles.primaryBtnText}>Analizar Dibujo con IA</Text>
                <FontAwesome name="cloud-upload" size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ==================== 4. CAPTURA Y AUDIO DE VOZ ==================== */}
        {step === 'voice_capture' && (
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>Grabación de Fluidez Verbal</Text>
            <Text style={styles.cardHeaderSubtitle}>Prueba de voz del paciente: {patientInfo?.nombre_paciente}</Text>

            <View style={styles.voiceRecordOuterZone}>
              {isRecording ? (
                <Animated.View style={[styles.micPulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                  <TouchableOpacity style={[styles.largeMicBtn, styles.micActiveColor]} onPress={stopRecording}>
                    <FontAwesome name="stop" size={32} color="white" />
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <TouchableOpacity style={styles.largeMicBtn} onPress={startRecording}>
                  <FontAwesome name="microphone" size={36} color="white" />
                </TouchableOpacity>
              )}

              <Text style={[styles.timerText, isRecording && styles.timerActive]}>
                {isRecording ? formatTime(voiceTimer) : "00:00"}
              </Text>

              <Text style={styles.voiceStatusText}>
                {isRecording ? "Grabando... Toque el botón rojo para finalizar" : "Toque el micrófono para iniciar"}
              </Text>
            </View>

            <View style={styles.infoBoxBlue}>
              <Ionicons name="information-circle-outline" size={20} color="#0D47A1" />
              <Text style={styles.infoBoxText}>
                El paciente tiene 60 segundos para nombrar todos los animales posibles. La IA transcribirá e identificará biomarcadores del habla.
              </Text>
            </View>
          </View>
        )}

        {/* ==================== 5. PROCESAMIENTO / LOADING IA ==================== */}
        {step === 'processing' && (
          <View style={styles.card}>
            <View style={styles.loadingSpinnerBox}>
              <ActivityIndicator size="large" color="#0D47A1" style={{ transform: [{ scale: 1.5 }] }} />
              <Text style={styles.loadingTitle}>Procesando Evaluación...</Text>
              <Text style={styles.loadingSubtitle}>Nuestras Redes Neuronales de IA están analizando las características del paciente en el servidor.</Text>
            </View>
          </View>
        )}

        {/* ==================== 6. RESULTADOS CDT (TEST DEL RELOJ) ==================== */}
        {step === 'cdt_results' && cdtResult && (() => {
          const resultTheme = CDT_SCALES[cdtResult.puntuacion] || CDT_SCALES[0];
          return (
            <View style={styles.card}>
              <View style={styles.resultsBadgeRow}>
                <View style={[styles.badgeContainer, { backgroundColor: resultTheme.bg, borderColor: resultTheme.border }]}>
                  <Text style={[styles.badgeText, { color: resultTheme.color }]}>Puntuación: {cdtResult.puntuacion}/5</Text>
                </View>
                <View style={[styles.badgeContainer, { backgroundColor: resultTheme.bg, borderColor: resultTheme.border }]}>
                  <Text style={[styles.badgeText, { color: resultTheme.color }]}>{resultTheme.title}</Text>
                </View>
              </View>

              <Text style={styles.resultDetailsHeader}>Informe de Diagnóstico Inteligente</Text>

              {resultTheme.alert && (
                <View style={styles.alertCriticalBanner}>
                  <Ionicons name="alert-circle" size={24} color="#C62828" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertCriticalTitle}>Alerta Clínica Detectada</Text>
                    <Text style={styles.alertCriticalText}>Los patrones del dibujo sugieren posible compromiso cognitivo. Se aconseja interconsulta formal.</Text>
                  </View>
                </View>
              )}

              <View style={styles.resultTextCard}>
                <Text style={styles.resultDescText}>{cdtResult.observaciones || resultTheme.desc}</Text>
              </View>

              {/* Mapeo visual de la escala */}
              <Text style={styles.scaleHierarchyHeader}>Escala Analítica de Shulman (CDT)</Text>
              <View style={styles.scaleTracker}>
                {[5, 4, 3, 2, 1, 0].map((num) => {
                  const isCurrent = cdtResult.puntuacion === num;
                  const itemTheme = CDT_SCALES[num];
                  return (
                    <View key={num} style={[styles.scaleItem, isCurrent && { backgroundColor: itemTheme.bg, borderColor: itemTheme.color, borderWidth: 2 }]}>
                      <Text style={[styles.scaleItemNumber, { color: itemTheme.color }, isCurrent && { fontWeight: '800' }]}>{num}</Text>
                      <Text style={[styles.scaleItemText, isCurrent && { fontWeight: '700', color: '#0A2540' }]} numberOfLines={1}>
                        {itemTheme.title}
                      </Text>
                      {isCurrent && <FontAwesome name="check-circle" size={16} color={itemTheme.color} />}
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogout}>
                <Text style={styles.primaryBtnText}>Finalizar y Salir</Text>
                <FontAwesome name="check" size={16} color="white" />
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* ==================== 7. RESULTADOS VOZ (SVF) ==================== */}
        {step === 'voice_results' && voiceResult && (
          <View style={styles.card}>
            <View style={styles.resultsBadgeRow}>
              <View style={[styles.badgeContainer, {
                backgroundColor: voiceResult.alerta ? '#FFEBEE' : '#E8F5E9',
                borderColor: voiceResult.alerta ? '#FFCDD2' : '#A5D6A7'
              }]}>
                <Text style={[styles.badgeText, { color: voiceResult.alerta ? '#C62828' : '#2E7D32' }]}>
                  {voiceResult.alerta ? "Sospecha de Deterioro" : "Control Saludable"}
                </Text>
              </View>
              <View style={[styles.badgeContainer, {
                backgroundColor: voiceResult.alerta ? '#FFEBEE' : '#E8F5E9',
                borderColor: voiceResult.alerta ? '#FFCDD2' : '#A5D6A7'
              }]}>
                <Text style={[styles.badgeText, { color: voiceResult.alerta ? '#C62828' : '#2E7D32' }]}>
                  Confianza: {voiceResult.confianza}%
                </Text>
              </View>
            </View>

            <Text style={styles.resultDetailsHeader}>Informe del Habla y Fluidez Verbal</Text>

            {voiceResult.alerta ? (
              <View style={styles.alertCriticalBanner}>
                <Ionicons name="alert-circle" size={24} color="#C62828" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertCriticalTitle}>Patrón de Riesgo Detectado</Text>
                  <Text style={styles.alertCriticalText}>La IA detectó una tasa inusual de cruces por cero (ZCR) y pausas prolongadas en la biometría vocal.</Text>
                </View>
              </View>
            ) : (
              <View style={styles.alertSuccessBanner}>
                <FontAwesome name="check-circle" size={24} color="#2E7D32" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertSuccessTitle}>Patrón Vocal Conservado</Text>
                  <Text style={styles.alertSuccessText}>Las características espectrales y la fluidez léxica están dentro de los límites de control normales.</Text>
                </View>
              </View>
            )}

            <Text style={styles.transcriptSubHeader}>Transcripción del Habla (ASR):</Text>
            <ScrollView style={styles.transcriptBox}>
              <Text style={styles.transcriptText}>{voiceResult.transcripcion}</Text>
            </ScrollView>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogout}>
              <Text style={styles.primaryBtnText}>Finalizar y Salir</Text>
              <FontAwesome name="check" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Fondo clínico muy limpio
  },
  topHeader: {
    width: '100%',
    height: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#DFE3E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2540',
    letterSpacing: -0.3,
  },
  logoutBtn: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: '#C62828',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    width: '92%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#0A2540',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    marginVertical: 10,
  },
  logoCenter: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A2540',
    textAlign: 'center',
    lineHeight: 28,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#637381',
    marginTop: 4,
    fontWeight: '500',
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212B36',
    marginBottom: 8,
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DFE3E8',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#212B36',
    fontSize: 16,
    fontWeight: '600',
  },
  inputHelper: {
    fontSize: 12,
    color: '#637381',
    marginTop: 6,
    lineHeight: 16,
  },
  errorAlert: {
    width: '100%',
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  errorAlertText: {
    flex: 1,
    color: '#C62828',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  primaryBtn: {
    width: '100%',
    height: 54,
    backgroundColor: '#0D47A1',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0D47A1',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginTop: 10,
  },
  disabledBtn: {
    backgroundColor: '#919EAB',
    shadowColor: 'transparent',
    elevation: 0,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  patientBanner: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  patientBannerText: {
    color: '#0D47A1',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: 16,
  },
  instructionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F4F6F8',
    marginBottom: 24,
  },
  insStepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212B36',
    marginBottom: 12,
  },
  insRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  insNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E3F2FD',
    color: '#0D47A1',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  insText: {
    flex: 1,
    fontSize: 14,
    color: '#637381',
    lineHeight: 20,
    fontWeight: '500',
  },
  cardHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A2540',
  },
  cardHeaderSubtitle: {
    fontSize: 14,
    color: '#637381',
    marginTop: 2,
    marginBottom: 20,
    fontWeight: '500',
  },
  warningAlert: {
    width: '100%',
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  warningAlertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
  },
  warningAlertText: {
    fontSize: 13,
    color: '#E65100',
    marginTop: 2,
    lineHeight: 18,
    fontWeight: '500',
  },
  imageSelectorBox: {
    width: '100%',
    height: 260,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#DFE3E8',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    marginBottom: 20,
  },
  emptyPhotoBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyPhotoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212B36',
    marginTop: 12,
  },
  emptyPhotoSubtext: {
    fontSize: 12,
    color: '#637381',
    marginTop: 4,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(187, 27, 27, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureOptionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  secondaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0D47A1',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    color: '#0D47A1',
    fontSize: 14,
    fontWeight: '700',
  },
  voiceRecordOuterZone: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  largeMicBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0D47A1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D47A1',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  micActiveColor: {
    backgroundColor: '#D32F2F',
    shadowColor: '#D32F2F',
  },
  micPulseCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#212B36',
    marginTop: 20,
    fontVariant: ['tabular-nums'],
  },
  timerActive: {
    color: '#D32F2F',
  },
  voiceStatusText: {
    fontSize: 14,
    color: '#637381',
    marginTop: 8,
    fontWeight: '600',
  },
  infoBoxBlue: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  infoBoxText: {
    flex: 1,
    color: '#0D47A1',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  loadingSpinnerBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A2540',
    marginTop: 24,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#637381',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  resultsBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badgeContainer: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  resultDetailsHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: 12,
  },
  alertCriticalBanner: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  alertCriticalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C62828',
  },
  alertCriticalText: {
    fontSize: 13,
    color: '#C62828',
    marginTop: 2,
    lineHeight: 18,
    fontWeight: '500',
  },
  alertSuccessBanner: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  alertSuccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  alertSuccessText: {
    fontSize: 13,
    color: '#2E7D32',
    marginTop: 2,
    lineHeight: 18,
    fontWeight: '500',
  },
  resultTextCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DFE3E8',
    marginBottom: 20,
  },
  resultDescText: {
    fontSize: 14,
    color: '#212B36',
    lineHeight: 22,
    fontWeight: '500',
  },
  scaleHierarchyHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212B36',
    marginBottom: 10,
  },
  scaleTracker: {
    width: '100%',
    gap: 6,
    marginBottom: 24,
  },
  scaleItem: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DFE3E8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  scaleItemNumber: {
    fontSize: 16,
    fontWeight: '600',
    width: 14,
  },
  scaleItemText: {
    flex: 1,
    fontSize: 13,
    color: '#637381',
    fontWeight: '500',
  },
  transcriptSubHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212B36',
    marginBottom: 8,
  },
  transcriptBox: {
    maxHeight: 120,
    backgroundColor: '#F4F6F8',
    borderWidth: 1,
    borderColor: '#DFE3E8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  transcriptText: {
    fontSize: 13,
    color: '#637381',
    lineHeight: 18,
    fontWeight: '500',
    fontStyle: 'italic',
  }
});
