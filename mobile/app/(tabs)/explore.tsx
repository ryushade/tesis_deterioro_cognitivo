import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Guía de Pruebas</Text>
        <Text style={styles.subtitle}>Información sobre evaluaciones cognitivas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sección: Centro de Salud */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome name="hospital-o" size={22} color="#0D47A1" />
            <Text style={styles.cardTitle}>Centro de Salud San Martín</Text>
          </View>
          <Text style={styles.cardBody}>
            Este aplicativo móvil forma parte del proyecto de tesis: *"Sistema inteligente para apoyar la evaluación del deterioro cognitivo en adultos mayores del Centro de Salud San Martín"*. Permite a pacientes realizar pruebas asistidas y registrar biomarcadores bajo supervisión clínica.
          </Text>
        </View>

        {/* Sección: Test del Reloj (CDT) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={22} color="#0D47A1" />
            <Text style={styles.cardTitle}>Test del Reloj (Clock Drawing Test)</Text>
          </View>
          <Text style={styles.cardBody}>
            El CDT es una prueba de cribado neuropsicológico simple y rápida que evalúa la capacidad visuoespacial, constructiva y las funciones ejecutivas de planificación.
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <FontAwesome name="chevron-right" size={10} color="#0D47A1" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>**Praxia constructiva:** Capacidad de trazar el círculo y organizar espacialmente las horas.</Text>
            </View>
            <View style={styles.bulletRow}>
              <FontAwesome name="chevron-right" size={10} color="#0D47A1" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>**Función ejecutiva:** Planificación del dibujo y colocación exacta de las manecillas (11:10).</Text>
            </View>
            <View style={styles.bulletRow}>
              <FontAwesome name="chevron-right" size={10} color="#0D47A1" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>**Clasificación de Shulman (0-5):** Criterio estándar utilizado por nuestro modelo ResNet18 de Inteligencia Artificial.</Text>
            </View>
          </View>
        </View>

        {/* Sección: Fluidez Verbal (SVF) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="mic-outline" size={22} color="#0D47A1" />
            <Text style={styles.cardTitle}>Test de Fluidez Verbal Semántica</Text>
          </View>
          <Text style={styles.cardBody}>
            La prueba de fluidez semántica consiste en nombrar la mayor cantidad de elementos pertenecientes a una categoría específica (ej: animales) en un tiempo límite de un minuto.
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <FontAwesome name="chevron-right" size={10} color="#0D47A1" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>**Memoria semántica:** Acceso y recuperación voluntaria de palabras almacenadas.</Text>
            </View>
            <View style={styles.bulletRow}>
              <FontAwesome name="chevron-right" size={10} color="#0D47A1" style={styles.bulletIcon} />
              <Text style={styles.bulletText}>**Función biométrica vocal:** Extracción de características acústicas (MFCCs, ZCR y Spectral Centroid) mediante inteligencia artificial Random Forest.</Text>
            </View>
          </View>
        </View>

        {/* Créditos de Tesis */}
        <View style={styles.creditCard}>
          <Text style={styles.creditTitle}>Créditos e Investigación Académica</Text>
          <Text style={styles.creditText}>
            Investigador: Marco - Tesis de Ingeniería de Sistemas e Informática.{"\n"}
            Asesoría Clínica: Centro de Salud San Martín.{"\n"}
            Módulos de IA: Inferencia de visión profunda y biometría acústica vocal.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#DFE3E8',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A2540',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#637381',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: '#0A2540',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#F4F6F8',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2540',
  },
  cardBody: {
    fontSize: 14,
    color: '#637381',
    lineHeight: 20,
    fontWeight: '500',
  },
  bulletList: {
    marginTop: 12,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletIcon: {
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#212B36',
    lineHeight: 18,
    fontWeight: '500',
  },
  creditCard: {
    backgroundColor: '#0D47A1',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  creditTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  creditText: {
    fontSize: 13,
    color: '#E3F2FD',
    lineHeight: 18,
    fontWeight: '500',
  }
});
