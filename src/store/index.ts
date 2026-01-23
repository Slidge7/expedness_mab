import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import transactionReducer from './transactionSlice';
import missionReducer from './missionSlice';
import itemReducer from './itemSlice';
import locationReducer from './locationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    locations: locationReducer,
    items: itemReducer,
    missions: missionReducer,
  },
  // Middleware is handled automatically by RTK
});

// Infer types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
