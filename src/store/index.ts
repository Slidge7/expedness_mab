import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import missionReducer from './missionSlice';
import itemReducer from './itemSlice';
import locationReducer from './locationSlice';
import clientReducer from './clientSlice';
import providerReducer from './providerSlice';
import overviewReducer from './overviewSlice';
import stockReducer from './stockSlice';
import catalogReducer from './catalogSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    locations: locationReducer,
    clients: clientReducer,
    providers: providerReducer,
    items: itemReducer,
    missions: missionReducer,
    overview: overviewReducer,
    stock: stockReducer,
    catalogs: catalogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
