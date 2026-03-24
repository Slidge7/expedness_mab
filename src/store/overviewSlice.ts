import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  overviewService,
  DashboardDTO,
  DateRangeParams,
  GroupBy,
} from '../features/dashboard/api/overviewService';

interface OverviewState {
  dashboard: DashboardDTO | null;
  loading: boolean;
  error: string | null;
}

const initialState: OverviewState = {
  dashboard: null,
  loading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  'overview/fetchDashboard',
  async (params: DateRangeParams & { groupBy?: GroupBy }) =>
    overviewService.getDashboard(params),
);

const overviewSlice = createSlice({
  name: 'overview',
  initialState,
  reducers: {
    clearOverview: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDashboard.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Something went wrong';
      });
  },
});

export const { clearOverview } = overviewSlice.actions;
export default overviewSlice.reducer;
