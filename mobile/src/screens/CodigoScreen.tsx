import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState } from '@/store';
import { setCodigo, setCodigoValido, setCargando, setError } from '@/store/cdtSlice';
import { CDTApiService } from '@/services/api';
import { RootStackParamList } from '@/types';

type CodigoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CodigoScreen'>;

const CodigoScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<CodigoScreenNavigationProp>();
  const { codigo, codigoValido, paciente, cargando, error } = useSelector((state: RootState) => state.cdt);
  
  const [codigoInputValue, setCodigoInputValue] = useState('');

  useEffect(() => {
    // Verificar conectividad al cargar la pantalla
    checkConnectivity();
  }, []);

  const checkConnectivity = async () => {
    try {
      const isConnected = await CDTApiService.verificarConectividad();
      if (!isConnected) {
        Alert.alert(
          'Sin conexión',
          'No se puede conectar con el servidor. Verifica tu conexión a internet.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error verificando conectividad:', error);
    }
  };

  const formatearCodigo = (texto: string) => {
    // Formatear código como CDT-YYYYMMDD-XXXXXXXX
    const soloAlphanumerico = texto.replace(/[^A-Z0-9]/g, '');
    
    if (soloAlphanumerico.length <= 3) {
      return soloAlphanumerico;
    } else if (soloAlphanumerico.length <= 11) {
      return `${soloAlphanumerico.slice(0, 3)}-${soloAlphanumerico.slice(3)}`;
    } else {
      return `${soloAlphanumerico.slice(0, 3)}-${soloAlphanumerico.slice(3, 11)}-${soloAlphanumerico.slice(11, 19)}`;
    }
  };

  const handleCodigoChange = (texto: string) => {
    const codigoFormateado = formatearCodigo(texto.toUpperCase());
    setCodigoInputValue(codigoFormateado);
    dispatch(setCodigo(codigoFormateado));
  };

  const validarCodigo = async () => {
    if (!codigoInputValue.trim()) {
      dispatch(setError('Por favor ingresa un código'));
      return;
    }

    dispatch(setCargando(true));
    dispatch(setError(undefined));

    try {
      const resultado = await CDTApiService.validarCodigo(codigoInputValue);
      dispatch(setCodigoValido(resultado));
      
      if (resultado.codigo_valido) {
        Alert.alert(
          'Código válido',
          `Paciente: ${resultado.paciente?.nombre_completo}\n¿Iniciar evaluación CDT?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Iniciar', 
              onPress: () => navigation.navigate('PreparacionScreen') 
            },
          ]
        );
      }
    } catch (error: any) {
      dispatch(setError(error.message));
      Alert.alert('Error', error.message);
    } finally {
      dispatch(setCargando(false));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Evaluación CDT</Text>
          <Text style={styles.subtitle}>Test del Reloj Digital</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Código de Acceso</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={codigoInputValue}
            onChangeText={handleCodigoChange}
            placeholder="CDT-20250916-XXXXXXXX"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={21} // CDT-YYYYMMDD-XXXXXXXX
            editable={!cargando}
          />
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          {paciente && codigoValido && (
            <View style={styles.pacienteInfo}>
              <Text style={styles.pacienteNombre}>
                {paciente.nombre_completo}
              </Text>
              {paciente.edad && (
                <Text style={styles.pacienteEdad}>
                  {paciente.edad} años
                </Text>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, cargando ? styles.buttonDisabled : null]}
          onPress={validarCodigo}
          disabled={cargando || !codigoInputValue.trim()}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Validar Código</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ingresa el código proporcionado por tu médico para comenzar la evaluación
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  pacienteInfo: {
    backgroundColor: '#d5f4e6',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  pacienteNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27ae60',
  },
  pacienteEdad: {
    fontSize: 14,
    color: '#27ae60',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CodigoScreen;
