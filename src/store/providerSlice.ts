import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  providerService,
  ProviderDTO,
} from '../features/providers/api/providerService';

interface ProviderState {
  items: ProviderDTO[];
  loading: boolean;
}

const initialState: ProviderState = {
  items: [],
  loading: false,
};

export const fetchProviders = createAsyncThunk(
  'providers/fetchAll',
  async () => {
    return await providerService.getAll();
  },
);

const providerSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProviders.pending, state => {
        state.loading = true;
      })
      .addCase(
        fetchProviders.fulfilled,
        (state, action: PayloadAction<ProviderDTO[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchProviders.rejected, state => {
        state.loading = false;
      });
  },
});

export default providerSlice.reducer;
