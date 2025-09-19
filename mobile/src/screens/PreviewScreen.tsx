import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootState } from '@/store';
import { setCargando, setError } from '@/store/cdtSlice';
import { CDTApiService } from '@/services/api';
import { RootStackParamList } from '@/types';

type PreviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PreviewScreen'>;
type PreviewScreenRouteProp = RouteProp<RootStackParamList, 'PreviewScreen'>;

const PreviewScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<PreviewScreenNavigationProp>();
  const route = useRoute<PreviewScreenRouteProp>();
  const { imagenUri } = route.params;
  const { tiempoDibujo, cargando } = useSelector((state: RootState) => state.cdt);

  const confirmarImagen = async () => {
    dispatch(setCargando(true));
    
    try {
      // Navegar a pantalla de procesamiento inmediatamente
      navigation.navigate('ProcesandoScreen');
      
      // En la pantalla de procesamiento se manejará la subida y procesamiento
    } catch (error: any) {
      dispatch(setError(error.message));
      Alert.alert('Error', error.message);
    }
  };

  const tomarOtraFoto = () => {
    navigation.goBack();
  };

  const formatearTiempo = (milisegundos: number): string => {
    const segundos = Math.floor(milisegundos / 1000);
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirmar Foto</Text>
        <Text style={styles.subtitle}>
          Tiempo de dibujo: {formatearTiempo(tiempoDibujo)}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: imagenUri }} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.checklistContainer}>
        <Text style={styles.checklistTitle}>Verifica que la foto:</Text>
        <Text style={styles.checklistItem}>✓ Muestre todo el reloj claramente</Text>
        <Text style={styles.checklistItem}>✓ Esté bien iluminada</Text>
        <Text style={styles.checklistItem}>✓ No tenga sombras que oculten partes</Text>
        <Text style={styles.checklistItem}>✓ Se vea nítida y legible</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, cargando ? styles.buttonDisabled : null]}
          onPress={confirmarImagen}
          disabled={cargando}
        >
          <Text style={styles.buttonText}>✓ Confirmar y Procesar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={tomarOtraFoto}
          disabled={cargando}
        >
          <Text style={styles.secondaryButtonText}>📷 Tomar otra foto</Text>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
  },
  checklistContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 12,
  },
  checklistItem: {
    fontSize: 14,
    color: '#2d5a35',
    marginBottom: 6,
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
    backgroundColor: '#27ae60',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3498db',
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
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PreviewScreen;
