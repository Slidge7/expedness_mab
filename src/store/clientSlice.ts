import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  clientService,
  ClientDTO,
} from '../features/clients/api/clientService';

interface ClientState {
  items: ClientDTO[];
  loading: boolean;
}

const initialState: ClientState = {
  items: [],
  loading: false,
};

export const fetchClients = createAsyncThunk('clients/fetchAll', async () => {
  return await clientService.getAll();
});

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchClients.pending, state => {
        state.loading = true;
      })
      .addCase(
        fetchClients.fulfilled,
        (state, action: PayloadAction<ClientDTO[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchClients.rejected, state => {
        state.loading = false;
      });
  },
});

export default clientSlice.reducer;
