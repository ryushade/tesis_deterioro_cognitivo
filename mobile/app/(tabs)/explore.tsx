import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="medical" size={20} color="#4F46E5" />
        </View>
        <View>
          <Text style={styles.title}>Guía de Pruebas</Text>
          <Text style={styles.subtitle}>Información clínica sobre las evaluaciones cognitivas</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sección: Centro de Salud */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <FontAwesome name="hospital-o" size={18} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>Centro de Salud San Martín</Text>
          </View>
          <Text style={styles.cardBody}>
            Este aplicativo móvil forma parte de la plataforma digital para el proyecto de tesis:{' '}
            <Text style={styles.cardBodyItalic}>
              {'"Sistema inteligente para apoyar la evaluación del deterioro cognitivo en adultos mayores del Centro de Salud San Martín"'}
            </Text>
            . Permite aplicar cribados automatizados y registrar biomarcadores clínicos con soporte de Inteligencia Artificial.
          </Text>
        </View>

        {/* Sección: Prueba de Reloj */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>Prueba del Reloj (CDT)</Text>
          </View>
          <Text style={styles.cardBody}>
            El Test del Reloj (Clock Drawing Test) es un instrumento de cribado neuropsicológico clásico diseñado para evaluar las capacidades visuoespaciales, visuo-constructoras y las funciones ejecutivas de planificación y organización temporal.
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletPointContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Praxia Constructiva</Text>: Habilidad para dibujar la circunferencia y situar las horas simétricamente.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletPointContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Función Ejecutiva</Text>: Capacidad de planificación al situar las manecillas indicando exactamente las 11:10.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletPointContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Inferencia por IA</Text>: Clasificación automática bajo la escala de Shulman (0 a 5 puntos) mediante una red neuronal profunda ResNet18.
              </Text>
            </View>
          </View>
        </View>

        {/* Sección: Prueba de Fluidez Verbal */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="mic-outline" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>Fluidez Verbal Semántica</Text>
          </View>
          <Text style={styles.cardBody}>
            La evaluación evalúa la recuperación de información semántica pidiendo al paciente que mencione la mayor cantidad de elementos en una categoría (animales) durante 60 segundos.
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletPointContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Memoria de Trabajo</Text>: Fluidez léxica, búsqueda y recuperación voluntaria de palabras.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletPointContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Análisis Acústico por IA</Text>: Procesamiento de la señal de voz (coeficientes MFCCs, ZCR y Spectral Centroid) mediante un modelo Random Forest.
              </Text>
            </View>
          </View>
        </View>

        {/* Sección: Créditos */}
        <View style={styles.creditCard}>
          <View style={styles.creditHeader}>
            <Ionicons name="ribbon-outline" size={22} color="#FFFFFF" />
            <Text style={styles.creditTitle}>Investigación Académica & Créditos</Text>
          </View>
          
          <View style={styles.creditDivider} />
          
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Investigador:</Text>
            <Text style={styles.creditValue}>Marco Rioja Valle</Text>
          </View>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Asesoría:</Text>
            <Text style={styles.creditValue}>Centro de Salud San Martín</Text>
          </View>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Soporte Clínico:</Text>
            <Text style={styles.creditValue}>
              Digitalización de MMSE, Test de Reloj por Computer Vision y Análisis Biométrico de Voz.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
  },
  header: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0', // Slate 200
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A', // Slate 900
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B', // Slate 500
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardBody: {
    fontSize: 14,
    color: '#475569', // Slate 600
    lineHeight: 22,
    fontWeight: '500',
  },
  cardBodyItalic: {
    fontStyle: 'italic',
    color: '#334155',
    fontWeight: '600',
  },
  bulletList: {
    marginTop: 16,
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletPointContainer: {
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#334155', // Slate 700
    lineHeight: 18,
    fontWeight: '500',
  },
  bulletBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  creditCard: {
    backgroundColor: '#4F46E5', // Indigo 600
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  creditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creditTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  creditDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 14,
  },
  creditRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  creditLabel: {
    width: 95,
    fontSize: 13,
    color: '#C7D2FE', // Indigo 200
    fontWeight: '700',
  },
  creditValue: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    fontWeight: '500',
  },
});
