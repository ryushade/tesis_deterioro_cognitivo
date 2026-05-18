import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // Colores corporativos médicos
  const activeColor = '#0D47A1'; // Azul médico
  const inactiveColor = '#919EAB'; // Gris suave

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#DFE3E8',
          backgroundColor: 'white',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Evaluación',
          tabBarIcon: ({ color }) => <FontAwesome name="stethoscope" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Información',
          tabBarIcon: ({ color }) => <FontAwesome name="info-circle" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
