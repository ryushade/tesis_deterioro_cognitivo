import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, CodigoAcceso, EvaluacionCDT } from '@/types';

const initialState: AppState = {
  codigo: '',
  codigoValido: false,
  paciente: undefined,
  evaluacion: undefined,
  id_evaluacion: undefined,
  imagen: undefined,
  tiempoDibujo: 0,
  cronometroActivo: false,
  cargando: false,
  error: undefined,
};

const cdtSlice = createSlice({
  name: 'cdt',
  initialState,
  reducers: {
    setCodigo: (state, action: PayloadAction<string>) => {
      state.codigo = action.payload;
      state.codigoValido = false;
      state.paciente = undefined;
      state.error = undefined;
    },
    
    setCodigoValido: (state, action: PayloadAction<CodigoAcceso>) => {
      state.codigoValido = action.payload.codigo_valido;
      state.paciente = action.payload.paciente;
      state.instrucciones = action.payload.instrucciones;
      state.tiempo_limite = action.payload.tiempo_limite;
      if (!action.payload.codigo_valido) {
        state.error = 'Código no válido o expirado';
      } else {
        state.error = undefined;
      }
    },
    
    iniciarCronometro: (state) => {
      state.cronometroActivo = true;
      state.tiempoDibujo = 0;
    },
    
    detenerCronometro: (state) => {
      state.cronometroActivo = false;
    },
    
    actualizarTiempo: (state, action: PayloadAction<number>) => {
      if (state.cronometroActivo) {
        state.tiempoDibujo = action.payload;
      }
    },
    
    setImagen: (state, action: PayloadAction<string>) => {
      state.imagen = action.payload;
    },
    
    setEvaluacion: (state, action: PayloadAction<EvaluacionCDT>) => {
      state.evaluacion = action.payload;
    },
    
    setIdEvaluacion: (state, action: PayloadAction<number>) => {
      state.id_evaluacion = action.payload;
    },
    
    setCargando: (state, action: PayloadAction<boolean>) => {
      state.cargando = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },
    
    resetApp: (_state) => {
      return {
        ...initialState,
        codigo: '',
      };
    },
    
    reiniciarEvaluacion: (_state) => {
      return {
        ...initialState,
        codigo: '',
      };
    },
  },
});

export const {
  setCodigo,
  setCodigoValido,
  iniciarCronometro,
  detenerCronometro,
  actualizarTiempo,
  setImagen,
  setEvaluacion,
  setIdEvaluacion,
  setCargando,
  setError,
  resetApp,
  reiniciarEvaluacion,
} = cdtSlice.actions;

export default cdtSlice.reducer;
