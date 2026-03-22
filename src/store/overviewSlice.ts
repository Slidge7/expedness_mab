import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  overviewService,
  SummaryDTO,
  PeriodEntry,
  CategoryEntry,
  GroupEntry,
  DateRangeParams,
  GroupBy,
} from '../features/dashboard/api/overviewService';

interface OverviewState {
  summary: SummaryDTO | null;
  periodEntries: PeriodEntry[];
  categoryEntries: CategoryEntry[];
  missionEntries: GroupEntry[];
  locationEntries: GroupEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: OverviewState = {
  summary: null,
  periodEntries: [],
  categoryEntries: [],
  missionEntries: [],
  locationEntries: [],
  loading: false,
  error: null,
};

export const fetchSummary = createAsyncThunk(
  'overview/fetchSummary',
  async (params: DateRangeParams & { topN?: number }) =>
    overviewService.getSummary(params),
);

export const fetchByPeriod = createAsyncThunk(
  'overview/fetchByPeriod',
  async (params: DateRangeParams & { groupBy?: GroupBy }) =>
    overviewService.getByPeriod(params),
);

export const fetchByCategory = createAsyncThunk(
  'overview/fetchByCategory',
  async (params: DateRangeParams) => overviewService.getByCategory(params),
);

export const fetchByMission = createAsyncThunk(
  'overview/fetchByMission',
  async (params: DateRangeParams) => overviewService.getByMission(params),
);

export const fetchByLocation = createAsyncThunk(
  'overview/fetchByLocation',
  async (params: DateRangeParams) => overviewService.getByLocation(params),
);

const overviewSlice = createSlice({
  name: 'overview',
  initialState,
  reducers: {
    clearOverview: () => initialState,
  },
  extraReducers: builder => {
    const setLoading = (state: OverviewState) => {
      state.loading = true;
      state.error = null;
    };
    const setError = (state: OverviewState, action: any) => {
      state.loading = false;
      state.error = action.error.message || 'Something went wrong';
    };

    builder
      .addCase(fetchSummary.pending, setLoading)
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, setError)

      .addCase(fetchByPeriod.pending, setLoading)
      .addCase(fetchByPeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.periodEntries = action.payload;
      })
      .addCase(fetchByPeriod.rejected, setError)

      .addCase(fetchByCategory.pending, setLoading)
      .addCase(fetchByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryEntries = action.payload;
      })
      .addCase(fetchByCategory.rejected, setError)

      .addCase(fetchByMission.pending, setLoading)
      .addCase(fetchByMission.fulfilled, (state, action) => {
        state.loading = false;
        state.missionEntries = action.payload;
      })
      .addCase(fetchByMission.rejected, setError)

      .addCase(fetchByLocation.pending, setLoading)
      .addCase(fetchByLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locationEntries = action.payload;
      })
      .addCase(fetchByLocation.rejected, setError);
  },
});

export const { clearOverview } = overviewSlice.actions;
export default overviewSlice.reducer;
