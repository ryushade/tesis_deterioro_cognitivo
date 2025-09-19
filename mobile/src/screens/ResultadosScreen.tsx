import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState } from '@/store';
import { reiniciarEvaluacion } from '@/store/cdtSlice';
import { RootStackParamList } from '@/types';

type ResultadosScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResultadosScreen'>;

const ResultadosScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<ResultadosScreenNavigationProp>();
  const { evaluacion, tiempoDibujo } = useSelector((state: RootState) => state.cdt);

  const interpretarPuntuacion = (puntuacion: number): { nivel: string; color: string; descripcion: string } => {
    if (puntuacion >= 8) {
      return {
        nivel: 'Normal',
        color: '#27ae60',
        descripcion: 'Capacidades cognitivas dentro de rangos normales para la edad.'
      };
    } else if (puntuacion >= 6) {
      return {
        nivel: 'Leve alteración',
        color: '#f39c12',
        descripcion: 'Dificultades menores detectadas. Requiere seguimiento clínico.'
      };
    } else if (puntuacion >= 4) {
      return {
        nivel: 'Alteración moderada',
        color: '#e67e22',
        descripcion: 'Dificultades significativas. Evaluación neuropsicológica recomendada.'
      };
    } else {
      return {
        nivel: 'Alteración severa',
        color: '#e74c3c',
        descripcion: 'Deterioro cognitivo importante. Evaluación neurológica prioritaria.'
      };
    }
  };

  const formatearTiempo = (milisegundos: number): string => {
    const segundos = Math.floor(milisegundos / 1000);
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    const str1 = mins.toString();
    const str2 = secs.toString();
    return `${str1.length === 1 ? '0' + str1 : str1}:${str2.length === 1 ? '0' + str2 : str2}`;
  };

  const compartirResultados = async () => {
    if (!evaluacion) return;

    const interpretacion = interpretarPuntuacion(evaluacion.puntuacion_total);
    const mensaje = `Resultado CDT\n\nPuntuación: ${evaluacion.puntuacion_total}/10\nTiempo: ${formatearTiempo(tiempoDibujo)}\nInterpretación: ${interpretacion.nivel}\n\n${interpretacion.descripcion}`;

    try {
      await Share.share({
        message: mensaje,
        title: 'Resultado Test del Reloj (CDT)',
      });
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo compartir el resultado');
    }
  };

  const nuevaEvaluacion = () => {
    dispatch(reiniciarEvaluacion());
    navigation.navigate('CodigoScreen');
  };

  if (!evaluacion) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No hay resultados disponibles</Text>
        <TouchableOpacity style={styles.button} onPress={nuevaEvaluacion}>
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const interpretacion = interpretarPuntuacion(evaluacion.puntuacion_total);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Resultados CDT</Text>
        <Text style={styles.subtitle}>Test del Dibujo del Reloj</Text>
      </View>

      {/* Puntuación Principal */}
      <View style={[styles.scoreContainer, { borderLeftColor: interpretacion.color }]}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreTextContainer}>
            <Text style={styles.scoreLabel}>Puntuación Total</Text>
            <Text style={[styles.scoreValue, { color: interpretacion.color }]}>
              {evaluacion.puntuacion_total}/10
            </Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: interpretacion.color }]}>
            <Text style={styles.scoreBadgeText}>{interpretacion.nivel}</Text>
          </View>
        </View>
        <Text style={styles.interpretationText}>{interpretacion.descripcion}</Text>
      </View>

      {/* Detalles de la Evaluación */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Detalles de la Evaluación</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tiempo de dibujo:</Text>
          <Text style={styles.detailValue}>{formatearTiempo(tiempoDibujo)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha:</Text>
          <Text style={styles.detailValue}>
            {new Date(evaluacion.fecha_evaluacion).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID de evaluación:</Text>
          <Text style={styles.detailValue}>#{evaluacion.id}</Text>
        </View>
      </View>

      {/* Puntuaciones Detalladas */}
      {evaluacion.detalles_puntuacion && (
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Puntuaciones por Criterio</Text>
          
          {Object.entries(evaluacion.detalles_puntuacion).map(([criterio, puntos]) => (
            <View key={criterio} style={styles.criterioRow}>
              <Text style={styles.criterioLabel}>{criterio.replace('_', ' ')}</Text>
              <View style={styles.puntosContainer}>
                <Text style={styles.puntosValue}>{puntos as number}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Botones de Acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={compartirResultados}>
          <Text style={styles.shareButtonText}>📤 Exportar Resultados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newTestButton} onPress={nuevaEvaluacion}>
          <Text style={styles.newTestButtonText}>🔄 Nueva Evaluación</Text>
        </TouchableOpacity>
      </View>

      {/* Nota Profesional */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          Resultados del Test del Reloj (CDT) para evaluación clínica. 
          Considera el contexto del paciente y otras evaluaciones neuropsicológicas para diagnóstico integral.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  scoreContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTextContainer: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  interpretationText: {
    fontSize: 14,
    color: '#5d6d7e',
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  criterioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  criterioLabel: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    textTransform: 'capitalize',
  },
  puntosContainer: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  puntosValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recommendationsContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  recommendationText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 22,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  newTestButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#27ae60',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  newTestButtonText: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerContainer: {
    backgroundColor: '#ffeaa7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#fdcb6e',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#2d3436',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultadosScreen;
