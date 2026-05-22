import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, ActivityIndicator, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { styles } from './EvaluationStyles';

interface ClockCameraScannerProps {
  onCapture: (uri: string) => void;
  onCancel: () => void;
}

export default function ClockCameraScanner({ onCapture, onCancel }: ClockCameraScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const facing: CameraType = 'back';
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const cameraRef = useRef<any>(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Scanning animation loop
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (!capturedImage) {
      scanAnim.setValue(0);
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 290,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    }
    return () => {
      if (anim) {
        anim.stop();
      }
    };
  }, [capturedImage, scanAnim]);

  if (!permission) {
    return (
      <View style={[styles.cameraContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ color: 'white', marginTop: 16, fontWeight: '600' }}>Iniciando cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.cameraContainer, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="camera-outline" size={72} color="#4F46E5" style={{ marginBottom: 16 }} />
        <Text style={[styles.scannerTitle, { textAlign: 'center', color: 'white', fontSize: 18, marginBottom: 8 }]}>Se requiere permiso de cámara</Text>
        <Text style={{ color: '#B0BEC5', textAlign: 'center', marginBottom: 24, lineHeight: 20, fontSize: 14 }}>
          Para poder capturar y analizar el dibujo del reloj, necesitamos acceso a la cámara de este dispositivo.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { width: '80%', backgroundColor: '#4F46E5' }]}
          onPress={requestPermission}
        >
          <Text style={styles.primaryBtnText}>Conceder permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 24 }}
          onPress={onCancel}
        >
          <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 15 }}>Cancelar y volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current && !capturing) {
      try {
        setCapturing(true);
        if (Platform.OS !== 'web') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.95,
          skipProcessing: false,
        });
        
        if (photo && photo.uri) {
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        console.error("Error capturando imagen:", error);
        alert("Error al capturar la imagen. Por favor intente de nuevo.");
      } finally {
        setCapturing(false);
      }
    }
  };

  const toggleFlash = () => {
    setFlash(prev => prev === 'off' ? 'on' : 'off');
  };

  const handleConfirm = async () => {
    if (capturedImage) {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  // Confirm / Preview State
  if (capturedImage) {
    return (
      <View style={styles.previewContainerFull}>
        <Image source={{ uri: capturedImage }} style={styles.previewImageFull} />
        
        <View style={styles.previewOverlay}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Vista Previa</Text>
            <Text style={styles.scannerSubtitle}>Revise que la foto se vea nítida y centrada</Text>
          </View>

          <View style={styles.checklistCard}>
            <View style={{ alignItems: 'center', marginBottom: 6 }}>
              <View style={{ 
                width: 56, height: 56, borderRadius: 28, 
                backgroundColor: '#EEF2FF', 
                justifyContent: 'center', alignItems: 'center', marginBottom: 12 
              }}>
                <Ionicons name="image-outline" size={28} color="#4F46E5" />
              </View>
              <Text style={styles.checklistTitle}>¿Desea usar esta foto?</Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, fontWeight: '500', paddingHorizontal: 8 }}>
                La IA analizará automáticamente la calidad y el contenido del dibujo.
              </Text>
            </View>

            <View style={styles.previewButtonsRow}>
              <TouchableOpacity 
                style={styles.previewRetakeBtn} 
                onPress={handleRetake}
              >
                <Text style={styles.previewRetakeText}>Reintentar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.previewConfirmBtn}
                onPress={handleConfirm}
              >
                <Text style={styles.previewConfirmText}>Usar esta foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Active Camera Stream Screen
  return (
    <View style={styles.cameraContainer}>
      <CameraView 
        style={styles.cameraView} 
        facing={facing} 
        flash={flash}
        ref={cameraRef}
      >
        <View style={styles.overlayContainer}>
          {/* Custom Cutout Overlay */}
          <View style={styles.maskContainer}>
            <View style={styles.maskRowSide} />
            <View style={styles.maskRowMiddle}>
              <View style={styles.maskCellSide} />
              <View style={styles.maskCenterHole}>
                <View style={styles.guideCircle}>
                  {/* Scan Line Animation */}
                  <Animated.View style={[
                    styles.scanLine, 
                    { transform: [{ translateY: scanAnim }] }
                  ]} />
                </View>
              </View>
              <View style={styles.maskCellSide} />
            </View>
            <View style={styles.maskRowSide} />
          </View>

          {/* Upper Info */}
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Escáner del Reloj</Text>
            <Text style={styles.scannerSubtitle}>Coloque el dibujo del reloj completo dentro del círculo guía</Text>
          </View>

          {/* Warning tips aligned with AI requirements */}
          <View style={styles.scannerInstructions}>
            <MaterialIcons name="lightbulb-outline" size={20} color="#FFD54F" />
            <Text style={styles.instructionText}>
              Evite brillos o sombras. Asegúrese de que el dibujo circular se alinee con el borde verde.
            </Text>
          </View>

          {/* Bottom camera controls */}
          <View style={styles.scannerControls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleFlash}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={flash === 'on' ? "flash" : "flash-off"} 
                size={22} 
                color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.shutterButton} 
              onPress={handleCapture}
              disabled={capturing}
              activeOpacity={0.8}
            >
              {capturing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <FontAwesome name="times" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
