import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { styles } from '../../components/evaluation/EvaluationStyles';
import {
  LoginStep,
  InstructionsStep,
  CdtCaptureStep,
  VoiceCaptureStep,
  ProcessingStep,
  CdtResultsStep,
  VoiceResultsStep
} from '../../components/evaluation/EvaluationSteps';
import ClockCameraScanner from '../../components/evaluation/ClockCameraScanner';

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return `http://${window.location.hostname}:5001/api`;
  }
  const experienceUrl = Constants.expoConfig?.hostUri || Constants.experienceUrl;
  if (experienceUrl) {
    const ip = experienceUrl.replace('exp://', '').replace('http://', '').split(':')[0];
    return `http://${ip}:5001/api`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';
};

const API_URL = getApiUrl();

const ProgressStepper = ({ currentStep }: { currentStep: string }) => {
  let activeIndex = 1;
  if (currentStep === 'instructions') activeIndex = 2;
  else if (currentStep === 'cdt_capture' || currentStep === 'voice_capture' || currentStep === 'processing') activeIndex = 3;
  else if (currentStep === 'cdt_results' || currentStep === 'voice_results') activeIndex = 4;

  const renderBadge = (index: number, label: string) => {
    const isActive = activeIndex === index;
    const isDone = activeIndex > index;
    return (
      <View style={styles.stepItem}>
        <View style={[
          styles.stepBadge,
          isActive && styles.stepBadgeActive,
          isDone && styles.stepBadgeDone
        ]}>
          {isDone ? (
            <Ionicons name="checkmark" size={12} color="white" />
          ) : (
            <Text style={[styles.stepBadgeText, isActive && styles.stepBadgeTextActive]}>{index}</Text>
          )}
        </View>
        <Text style={[styles.stepText, isActive && styles.stepTextActive]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.stepperContainer}>
      {renderBadge(1, 'Ingreso')}
      <View style={[styles.stepConnector, activeIndex > 1 && styles.stepConnectorActive]} />
      {renderBadge(2, 'Instrucciones')}
      <View style={[styles.stepConnector, activeIndex > 2 && styles.stepConnectorActive]} />
      {renderBadge(3, 'Prueba')}
      <View style={[styles.stepConnector, activeIndex > 3 && styles.stepConnectorActive]} />
      {renderBadge(4, 'Resultados')}
    </View>
  );
};

export default function HomeScreen() {
  const [step, setStep] = useState<'login' | 'instructions' | 'cdt_capture' | 'voice_capture' | 'cdt_results' | 'voice_results' | 'processing'>('login');
  const [showScanner, setShowScanner] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState(API_URL);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cdtResult, setCdtResult] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [voiceIsRecording, setVoiceIsRecording] = useState(false);
  const [voiceIsPaused, setVoiceIsPaused] = useState(false);
  const [voiceCurrentIndex, setVoiceCurrentIndex] = useState(0);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [voiceResult, setVoiceResult] = useState<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Recording pulsing animation
  useEffect(() => {
    if (voiceIsRecording && !voiceIsPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [voiceIsRecording, voiceIsPaused, pulseAnim]);

  const handleVoiceFinish = useCallback(async () => {
    if (!recording) return;
    setVoiceIsRecording(false);
    setVoiceIsPaused(false);
    setStep('processing');
    try {
      await recording.stopAndUnloadAsync();
      setRecording(null);

      // Simulating analysis latency (4 seconds)
      setTimeout(() => {
        const hasAlert = Math.random() > 0.4;
        setVoiceResult({
          clase_predicha: hasAlert ? 1 : 0,
          alerta: hasAlert,
          confianza: (Math.random() * 18 + 78).toFixed(1),
          transcripcion: "El paciente describe su rutina diaria de forma de conversación... Nombra animales variados... Dice palabras con la letra P... Repite la frase del gato correctamente... Rememora los objetos anteriores."
        });
        setStep('voice_results');
      }, 4000);
    } catch (err) {
      console.error("Error stopping recording:", err);
      setStep('voice_capture');
    }
  }, [recording]);

  const handleVoiceNextQuestion = useCallback(async () => {
    if (!recording) return;
    try {
      if (voiceCurrentIndex < 4) {
        await recording.pauseAsync();
        setVoiceIsPaused(true);
        setVoiceCurrentIndex((prev) => prev + 1);
        setVoiceTimer(0);
      } else {
        await handleVoiceFinish();
      }
    } catch (err) {
      console.error("Error advancing to next question:", err);
    }
  }, [recording, voiceCurrentIndex, handleVoiceFinish]);

  // Recording timer and auto-advance logic (T2 / T3)
  useEffect(() => {
    if (voiceIsRecording && !voiceIsPaused) {
      timerIntervalRef.current = setInterval(() => {
        setVoiceTimer((prev) => {
          const nextVal = prev + 1;
          if ((voiceCurrentIndex === 1 || voiceCurrentIndex === 2) && nextVal >= 60) {
            clearInterval(timerIntervalRef.current);
            setTimeout(() => {
              handleVoiceNextQuestion();
            }, 50);
            return 0;
          }
          return nextVal;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [voiceIsRecording, voiceIsPaused, voiceCurrentIndex, recording, handleVoiceNextQuestion]);

  const handleLogout = () => {
    setStep('login'); setAccessCode(''); setPatientInfo(null); setErrorMessage(null);
    setImageUri(null); setCdtResult(null); setVoiceResult(null); setRejectReason(null);
    if (recording) {
      recording.stopAndUnloadAsync().catch(() => { });
    }
    setRecording(null);
    setVoiceIsRecording(false);
    setVoiceIsPaused(false);
    setVoiceCurrentIndex(0);
    setVoiceTimer(0);
  };

  const handlePatientLogin = async () => {
    if (!accessCode || accessCode.trim().length < 4) {
      setErrorMessage("Por favor ingrese un código de acceso válido."); return;
    }
    setLoading(true); setErrorMessage(null);
    try {
      const response = await fetch(`${apiUrl}/auth/patient-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_code: accessCode.trim().toUpperCase() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPatientInfo(data.codigo_info); setStep('instructions');
      } else {
        setErrorMessage(data.message || "Código de acceso inválido.");
      }
    } catch (error) {
      console.error("Error matching access code:", error);
      setErrorMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const startEvaluation = () => {
    const isCdt = patientInfo?.tipo_evaluacion?.toLowerCase().includes('reloj') || patientInfo?.tipo_evaluacion === 'CDT';
    setStep(isCdt ? 'cdt_capture' : 'voice_capture');
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return alert("Permiso denegado");
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.9 });
        if (!result.canceled && result.assets) { setImageUri(result.assets[0].uri); setRejectReason(null); }
      } catch (e) {
        console.error("Error in camera picker:", e);
        alert("Error abriendo cámara");
      }
    } else {
      setShowScanner(true);
    }
  };

  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return alert("Permiso denegado");
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.9 });
      if (!result.canceled && result.assets) { setImageUri(result.assets[0].uri); setRejectReason(null); }
    } catch (e) {
      console.error("Error in gallery picker:", e);
      alert("Error abriendo galería");
    }
  };

  const submitCdtTest = async () => {
    if (!imageUri) return;
    setStep('processing'); setRejectReason(null);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, 'cdt_clock_drawing.jpg');
      } else {
        formData.append('file', { uri: imageUri, name: 'cdt_clock_drawing.jpg', type: 'image/jpeg' } as any);
      }
      formData.append('id_asignacion', patientInfo.id_codigo.toString());

      const uploadResponse = await fetch(`${apiUrl}/cdt/upload`, { method: 'POST', body: formData });
      const uploadData = await uploadResponse.json();

      if (uploadResponse.ok && uploadData.success) {
        setCdtResult(uploadData.resultado); setStep('cdt_results');
      } else {
        setRejectReason(uploadData.message || "Error al procesar la imagen."); setStep('cdt_capture');
      }
    } catch (error) {
      console.error("Error in submitCdtTest:", error);
      setRejectReason("Error de conexión."); setStep('cdt_capture');
    }
  };

  const handleVoiceStart = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setVoiceCurrentIndex(0);
        setVoiceTimer(0);
        setVoiceIsRecording(true);
        setVoiceIsPaused(false);
      } else {
        alert("Permisos de micrófono requeridos para realizar la prueba.");
      }
    } catch (err) {
      console.error("Error starting voice recording:", err);
    }
  };

  const handleVoiceTogglePause = async () => {
    if (!recording) return;
    try {
      if (voiceIsPaused) {
        await recording.startAsync();
        setVoiceIsPaused(false);
      } else {
        await recording.pauseAsync();
        setVoiceIsPaused(true);
      }
    } catch (err) {
      console.error("Error toggling voice pause:", err);
    }
  };

  const handleVoiceCancel = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (err) {
        console.error(err);
      }
    }
    setRecording(null);
    setVoiceIsRecording(false);
    setVoiceIsPaused(false);
    setVoiceCurrentIndex(0);
    setVoiceTimer(0);
    setStep('instructions');
  };

  const formatTime = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  if (showScanner) {
    return (
      <ClockCameraScanner
        onCapture={(uri) => {
          setImageUri(uri);
          setRejectReason(null);
          setShowScanner(false);
        }}
        onCancel={() => setShowScanner(false)}
      />
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <FontAwesome name="heartbeat" size={24} color="#4F46E5" />
          <Text style={styles.headerBrand}>Centro de salud San Martín</Text>
        </View>
        {step !== 'login' && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Salir</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProgressStepper currentStep={step} />
        {step === 'login' && (
          <LoginStep
            accessCode={accessCode}
            setAccessCode={setAccessCode}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            handlePatientLogin={handlePatientLogin}
            loading={loading}
            apiUrl={apiUrl}
            setApiUrl={setApiUrl}
          />
        )}
        {step === 'instructions' && <InstructionsStep patientInfo={patientInfo} startEvaluation={startEvaluation} />}
        {step === 'cdt_capture' && <CdtCaptureStep patientInfo={patientInfo} rejectReason={rejectReason} imageUri={imageUri} setImageUri={setImageUri} takePhoto={takePhoto} pickFromGallery={pickFromGallery} submitCdtTest={submitCdtTest} setRejectReason={setRejectReason} />}
        {step === 'voice_capture' && (
          <VoiceCaptureStep
            patientInfo={patientInfo}
            voiceCurrentIndex={voiceCurrentIndex}
            voiceIsRecording={voiceIsRecording}
            voiceIsPaused={voiceIsPaused}
            voiceTimer={voiceTimer}
            formatTime={formatTime}
            pulseAnim={pulseAnim}
            onStartRecording={handleVoiceStart}
            onTogglePause={handleVoiceTogglePause}
            onNextQuestion={handleVoiceNextQuestion}
            onCancel={handleVoiceCancel}
          />
        )}
        {step === 'processing' && <ProcessingStep />}
        {step === 'cdt_results' && <CdtResultsStep cdtResult={cdtResult} handleLogout={handleLogout} />}
        {step === 'voice_results' && <VoiceResultsStep voiceResult={voiceResult} handleLogout={handleLogout} />}
      </ScrollView>
    </View>
  );
}
