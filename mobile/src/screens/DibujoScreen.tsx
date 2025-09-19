import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState } from '@/store';
import { actualizarTiempo, detenerCronometro } from '@/store/cdtSlice';
import { RootStackParamList } from '@/types';

type DibujoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DibujoScreen'>;

const DibujoScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<DibujoScreenNavigationProp>();
  const { cronometroActivo, tiempoDibujo } = useSelector((state: RootState) => state.cdt);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (cronometroActivo) {
      // Iniciar cronómetro
      intervalRef.current = setInterval(() => {
        dispatch(actualizarTiempo(Date.now()));
      }, 100); // Actualizar cada 100ms para suavidad

      // Iniciar animación de pulso para el cronómetro
      startPulseAnimation();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cronometroActivo, dispatch]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const formatearTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const segundosTranscurridos = Math.floor((tiempoDibujo || 0) / 1000);

  const terminarDibujo = () => {
    Alert.alert(
      'Terminar evaluación',
      '¿El paciente ha terminado de dibujar?',
      [
        { text: 'Continuar', style: 'cancel' },
        { 
          text: 'Tomar foto', 
          onPress: () => {
            dispatch(detenerCronometro());
            navigation.navigate('CamaraScreen');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Evaluación en Curso</Text>
        <Text style={styles.subtitle}>El paciente está dibujando</Text>
      </View>

      <View style={styles.cronometroContainer}>
        <Animated.View 
          style={[
            styles.cronometroCircle, 
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Text style={styles.cronometroTiempo}>
            {formatearTiempo(segundosTranscurridos)}
          </Text>
          <Text style={styles.cronometroLabel}>
            {cronometroActivo ? 'En progreso' : 'Pausado'}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.instructionsCard}>
        <Text style={styles.cardTitle}>Instrucción dada al paciente:</Text>
        <Text style={styles.instructionText}>
          "Dibuje un reloj que marque las 11:10. Incluya todos los números del 1 al 12 y las dos manecillas."
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={terminarDibujo}
        >
          <Text style={styles.buttonText}>Paciente Terminó - Tomar Foto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Cancelar Evaluación</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
        </Text>
        <Text style={styles.statusSubtext}>
          Cuando termines, presiona "He terminado" para tomar la foto
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={terminarDibujo}
        >
          <Text style={styles.buttonText}>He terminado</Text>
        </TouchableOpacity>

        {cronometroActivo && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={pausarCronometro}
          >
            <Text style={styles.secondaryButtonText}>Pausar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.tertiaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  cronometroContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cronometroCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cronometroTiempo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  cronometroLabel: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  reminder: {
    paddingLeft: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 6,
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  statusText: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#2d5a35',
    lineHeight: 18,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#27ae60',
  },
  secondaryButton: {
    backgroundColor: '#f39c12',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DibujoScreen;
