import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState } from '@/store';
import { 
  setCargando, 
  setError,
  setEvaluacion
} from '@/store/cdtSlice';
import { CDTApiService } from '@/services/api';
import { RootStackParamList } from '@/types';

type ProcesandoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProcesandoScreen'>;

const ProcesandoScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<ProcesandoScreenNavigationProp>();
  const { imagen: imagenUri, id_evaluacion, tiempoDibujo } = useSelector((state: RootState) => state.cdt);
  const [progreso, setProgreso] = useState<string>('Preparando...');

  useEffect(() => {
    procesarEvaluacion();
  }, []);

  const procesarEvaluacion = async () => {
    try {
      // Paso 1: Subir imagen y obtener resultados directamente
      setProgreso('Subiendo imagen...');
      
      if (!imagenUri || !id_evaluacion) {
        throw new Error('Datos de evaluación incompletos');
      }

      setProgreso('Procesando imagen con IA...');
      const response = await CDTApiService.subirImagenCDT(id_evaluacion, imagenUri, tiempoDibujo);
      
      if (!response.success) {
        throw new Error(response.error || 'Error al subir imagen');
      }

      // Guardar la evaluación completada en el store
      if (response.evaluacion) {
        dispatch(setEvaluacion(response.evaluacion));
      }

      // El backend ya procesó la imagen y devuelve los resultados
      setProgreso('¡Análisis completado!');
      
      // Navegar directamente a los resultados
      setTimeout(() => {
        navigation.navigate('ResultadosScreen');
      }, 1500);

    } catch (error: any) {
      console.error('Error procesando evaluación:', error);
      dispatch(setError(error.message));
      Alert.alert(
        'Error',
        'Hubo un problema procesando la evaluación. ¿Deseas intentar nuevamente?',
        [
          {
            text: 'Reintentar',
            onPress: () => procesarEvaluacion(),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => navigation.navigate('CodigoScreen'),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>

        <Text style={styles.title}>Analizando CDT</Text>
        
        <Text style={styles.subtitle}>
          Procesando imagen con algoritmos de IA neuropsicológica
        </Text>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{progreso}</Text>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Pasos del análisis:</Text>
          <Text style={styles.stepItem}>1. Subir imagen al servidor</Text>
          <Text style={styles.stepItem}>2. Detectar elementos del reloj</Text>
          <Text style={styles.stepItem}>3. Evaluar precisión de la hora</Text>
          <Text style={styles.stepItem}>4. Calcular puntuación CDT</Text>
          <Text style={styles.stepItem}>5. Generar reporte detallado</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Este proceso puede tomar entre 1-5 minutos dependiendo de la complejidad del dibujo.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  progressContainer: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
  },
  progressText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
    textAlign: 'center',
  },
  stepsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  stepItem: {
    fontSize: 14,
    color: '#5d6d7e',
    marginBottom: 8,
    paddingLeft: 16,
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProcesandoScreen;
