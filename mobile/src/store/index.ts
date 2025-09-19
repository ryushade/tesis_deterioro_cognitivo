import { configureStore } from '@reduxjs/toolkit';
import cdtReducer from './cdtSlice';

export const store = configureStore({
  reducer: {
    cdt: cdtReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
