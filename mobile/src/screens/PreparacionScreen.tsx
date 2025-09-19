import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState } from '@/store';
import { iniciarCronometro, setCargando, setError, setIdEvaluacion } from '@/store/cdtSlice';
import { CDTApiService } from '@/services/api';
import { RootStackParamList } from '@/types';

type PreparacionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PreparacionScreen'>;

const PreparacionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<PreparacionScreenNavigationProp>();
  const { codigo, paciente, cargando } = useSelector((state: RootState) => state.cdt);
  
  const [evaluacionIniciada, setEvaluacionIniciada] = useState(false);

  const iniciarEvaluacion = async () => {
    dispatch(setCargando(true));
    dispatch(setError(undefined));

    try {
      // Iniciar evaluación en el backend
      const resultado = await CDTApiService.iniciarEvaluacion(codigo);
      
      // Guardar ID de evaluación en el store
      dispatch(setIdEvaluacion(resultado.id_evaluacion));
      
      setEvaluacionIniciada(true);
      
      Alert.alert(
        'Evaluación iniciada',
        'Ahora puedes comenzar a dibujar. Presiona "Comenzar a dibujar" cuando estés listo.',
        [{ text: 'Entendido' }]
      );
      
    } catch (error: any) {
      dispatch(setError(error.message));
      Alert.alert('Error', error.message);
    } finally {
      dispatch(setCargando(false));
    }
  };

  const comenzarDibujo = () => {
    dispatch(iniciarCronometro());
    navigation.navigate('DibujoScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Evaluación CDT</Text>
        {paciente && (
          <View style={styles.pacienteCard}>
            <Text style={styles.pacienteNombre}>
              {paciente.nombre_completo}
            </Text>
            <Text style={styles.pacienteEdad}>
              {paciente.edad} años
            </Text>
          </View>
        )}
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instrucciones al Paciente</Text>
        <Text style={styles.instructionText}>
          "Dibuje un reloj que marque las 11:10. Incluya todos los números del 1 al 12 y las dos manecillas."
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        {!evaluacionIniciada ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, cargando ? styles.buttonDisabled : null]}
            onPress={iniciarEvaluacion}
            disabled={cargando}
          >
            <Text style={styles.buttonText}>
              {cargando ? 'Preparando...' : 'Iniciar Evaluación'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={comenzarDibujo}
          >
            <Text style={styles.buttonText}>Paciente Listo - Continuar</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
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
    marginBottom: 16,
  },
  pacienteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pacienteNombre: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 4,
  },
  pacienteEdad: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  successButton: {
    backgroundColor: '#27ae60',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#95a5a6',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
});
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 22,
    flex: 1,
  },
  exampleContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 12,
  },
  clockExample: {
    alignItems: 'center',
  },
  clockText: {
    fontSize: 48,
    marginBottom: 8,
  },
  exampleSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  importantNote: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginTop: 16,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
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
    backgroundColor: '#3498db',
  },
  successButton: {
    backgroundColor: '#27ae60',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#bdc3c7',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#7f8c8d',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PreparacionScreen;
