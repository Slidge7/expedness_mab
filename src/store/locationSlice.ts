import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  locationService,
  LocationDTO,
} from '../features/locations/api/locationService';

interface LocationState {
  items: LocationDTO[];
  loading: boolean;
}

const initialState: LocationState = {
  items: [],
  loading: false,
};

export const fetchLocations = createAsyncThunk(
  'locations/fetchAll',
  async () => {
    return await locationService.getAll();
  },
);

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchLocations.pending, state => {
        state.loading = true;
      })
      .addCase(
        fetchLocations.fulfilled,
        (state, action: PayloadAction<LocationDTO[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchLocations.rejected, state => {
        state.loading = false;
      });
  },
});

export default locationSlice.reducer;
