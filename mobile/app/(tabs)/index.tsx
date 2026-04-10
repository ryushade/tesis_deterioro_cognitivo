import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        // Iniciamos la grabacion en Alta Calidad
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      } else {
        alert('Se requieren permisos de micrófono para realizar la prueba.');
      }
    } catch (err) {
      console.error('Fallo al iniciar la grabación', err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    if (!recording) return;
    
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
    setRecording(null);
  }

  return (
    <View style={styles.container}>
      {/* Header Clínico */}
      <View style={styles.header}>
        <Text style={styles.title}>Evaluación Cognitiva</Text>
        <Text style={styles.subtitle}>Prueba de Fluidez Verbal (SVF)</Text>
      </View>

      {/* Contenedor Principal */}
      <View style={styles.card}>
        <View style={styles.instructionBox}>
          <FontAwesome name="stethoscope" size={24} color="#0D47A1" />
          <Text style={styles.instructionTitle}>Instrucciones:</Text>
          <Text style={styles.instructionText}>
            Pulse el micrófono y pídale al paciente que nombre animales de forma continua durante 60 segundos.
          </Text>
        </View>

        {/* Zona de Grabación */}
        <View style={styles.recordingSection}>
          <TouchableOpacity 
            style={[styles.recordButton, isRecording && styles.recordingActive]} 
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            <FontAwesome 
              name={isRecording ? "stop" : "microphone"} 
              size={40} 
              color="white" 
            />
          </TouchableOpacity>
          <Text style={[styles.statusText, isRecording && styles.statusRecording]}>
            {isRecording ? "Grabando paciente..." : "Tocar para grabar"}
          </Text>
        </View>

        {audioUri && !isRecording && (
          <View style={styles.successBox}>
            <FontAwesome name="check-circle" size={24} color="#2E7D32" />
            <Text style={styles.successText}>Audio capturado con éxito</Text>
            {/* Aquí iría el botón para Enviar al backend vía fetch() */}
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Analizar con IA</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Fondo gris muy claro médico
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A2540',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#637381',
    marginTop: 4,
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  instructionBox: {
    backgroundColor: '#E3F2FD', // Azul muy suave
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D47A1',
    marginTop: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#1565C0',
    marginTop: 4,
    lineHeight: 22,
  },
  recordingSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0D47A1', // Azul médico corporativo
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D47A1',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  recordingActive: {
    backgroundColor: '#D32F2F', // Rojo emergencia
    shadowColor: '#D32F2F',
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#637381',
  },
  statusRecording: {
    color: '#D32F2F',
    fontWeight: '800',
  },
  successBox: {
    marginTop: 24,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  successText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 16,
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#0A2540',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
