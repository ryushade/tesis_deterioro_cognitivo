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
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  // Checklist states
  const [checkedItems, setCheckedItems] = useState({
    circle: false,
    readable: false,
    noShadows: false,
  });

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
  }, [capturedImage]);

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
        alert("Error al capturar la imagen. Por favor intente de nuevo.");
      } finally {
        setCapturing(false);
      }
    }
  };

  const toggleFlash = () => {
    setFlash(prev => prev === 'off' ? 'on' : 'off');
  };

  const toggleFacing = () => {
    setFacing(prev => prev === 'back' ? 'front' : 'back');
  };

  const toggleCheckItem = async (key: 'circle' | 'readable' | 'noShadows') => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
    setCheckedItems({
      circle: false,
      readable: false,
      noShadows: false,
    });
  };

  const allChecked = checkedItems.circle && checkedItems.readable && checkedItems.noShadows;

  // Confirm / Preview State
  if (capturedImage) {
    return (
      <View style={styles.previewContainerFull}>
        <Image source={{ uri: capturedImage }} style={styles.previewImageFull} />
        
        <View style={styles.previewOverlay}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Verificación de Calidad</Text>
            <Text style={styles.scannerSubtitle}>Asegúrese de cumplir con los requisitos para evitar rechazos</Text>
          </View>

          <View style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>Validaciones requeridas:</Text>
            
            <TouchableOpacity 
              style={styles.checklistItem} 
              onPress={() => toggleCheckItem('circle')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={checkedItems.circle ? "checkbox" : "square-outline"} 
                size={24} 
                color={checkedItems.circle ? "#10B981" : "#94A3B8"} 
              />
              <Text style={styles.checklistText}>El reloj está dibujado completamente a mano alzada (esfera no industrial)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checklistItem} 
              onPress={() => toggleCheckItem('readable')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={checkedItems.readable ? "checkbox" : "square-outline"} 
                size={24} 
                color={checkedItems.readable ? "#10B981" : "#94A3B8"} 
              />
              <Text style={styles.checklistText}>Todos los números y manecillas (las 11:10) son legibles</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checklistItem} 
              onPress={() => toggleCheckItem('noShadows')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={checkedItems.noShadows ? "checkbox" : "square-outline"} 
                size={24} 
                color={checkedItems.noShadows ? "#10B981" : "#94A3B8"} 
              />
              <Text style={styles.checklistText}>No hay sombras oscuras ni reflejos molestos de flash en la hoja</Text>
            </TouchableOpacity>

            <View style={styles.previewButtonsRow}>
              <TouchableOpacity 
                style={styles.previewRetakeBtn} 
                onPress={handleRetake}
              >
                <Text style={styles.previewRetakeText}>Reintentar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.previewConfirmBtn, 
                  !allChecked && { backgroundColor: '#CBD5E1', opacity: 0.7 }
                ]} 
                onPress={handleConfirm}
                disabled={!allChecked}
              >
                <Text style={styles.previewConfirmText}>Usar foto</Text>
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
