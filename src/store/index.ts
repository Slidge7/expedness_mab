import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import transactionReducer from './transactionSlice';
import missionReducer from './missionSlice';
import itemReducer from './itemSlice';
import locationReducer from './locationSlice';
import clientReducer from './clientSlice';
import providerReducer from './providerSlice';
import overviewReducer from './overviewSlice';
import stockReducer from './stockSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    locations: locationReducer,
    clients: clientReducer,
    providers: providerReducer,
    items: itemReducer,
    missions: missionReducer,
    overview: overviewReducer,
    stock: stockReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
