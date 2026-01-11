import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  missionService,
  MissionDTO,
} from '../features/missions/api/missionService';

export const fetchMissions = createAsyncThunk('missions/fetchAll', async () => {
  return await missionService.getAll();
});

const missionSlice = createSlice({
  name: 'missions',
  initialState: { items: [] as MissionDTO[], loading: false },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchMissions.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export default missionSlice.reducer;
