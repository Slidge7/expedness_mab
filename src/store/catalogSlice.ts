import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  catalogService,
  CatalogDTO,
  CatalogOrderDTO,
  CatalogOrderStatus,
  CreateCatalogData,
} from '../features/catalog/api/catalogService';

interface CatalogState {
  catalogs: CatalogDTO[];
  selectedCatalog: CatalogDTO | null;
  orders: CatalogOrderDTO[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  catalogs: [],
  selectedCatalog: null,
  orders: [],
  loading: false,
  error: null,
};

export const fetchCatalogs = createAsyncThunk('catalogs/fetchAll', async () => {
  return await catalogService.getAll();
});

export const fetchCatalogById = createAsyncThunk(
  'catalogs/fetchById',
  async (id: number) => {
    return await catalogService.getById(id);
  },
);

export const createCatalog = createAsyncThunk(
  'catalogs/create',
  async (data: CreateCatalogData) => {
    return await catalogService.create(data);
  },
);

export const updateCatalog = createAsyncThunk(
  'catalogs/update',
  async ({ id, data }: { id: number; data: CreateCatalogData }) => {
    return await catalogService.update(id, data);
  },
);

export const deleteCatalog = createAsyncThunk(
  'catalogs/delete',
  async (id: number) => {
    await catalogService.delete(id);
    return id;
  },
);

export const fetchCatalogOrders = createAsyncThunk(
  'catalogs/fetchOrders',
  async (catalogId: number) => {
    return await catalogService.getOrders(catalogId);
  },
);

export const updateOrderStatus = createAsyncThunk(
  'catalogs/updateOrderStatus',
  async ({ orderId, status }: { orderId: number; status: CatalogOrderStatus }) => {
    return await catalogService.updateOrderStatus(orderId, status);
  },
);

const catalogSlice = createSlice({
  name: 'catalogs',
  initialState,
  reducers: {
    clearSelectedCatalog: state => {
      state.selectedCatalog = null;
      state.orders = [];
    },
    clearCatalogError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCatalogs.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogs.fulfilled, (state, action: PayloadAction<CatalogDTO[]>) => {
        state.loading = false;
        state.catalogs = action.payload;
      })
      .addCase(fetchCatalogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load catalogs';
      })
      .addCase(fetchCatalogById.fulfilled, (state, action: PayloadAction<CatalogDTO>) => {
        state.selectedCatalog = action.payload;
      })
      .addCase(createCatalog.fulfilled, (state, action: PayloadAction<CatalogDTO>) => {
        state.catalogs.unshift(action.payload);
      })
      .addCase(updateCatalog.fulfilled, (state, action: PayloadAction<CatalogDTO>) => {
        const idx = state.catalogs.findIndex(c => c.id === action.payload.id);
        if (idx >= 0) state.catalogs[idx] = action.payload;
        if (state.selectedCatalog?.id === action.payload.id) {
          state.selectedCatalog = action.payload;
        }
      })
      .addCase(deleteCatalog.fulfilled, (state, action: PayloadAction<number>) => {
        state.catalogs = state.catalogs.filter(c => c.id !== action.payload);
      })
      .addCase(fetchCatalogOrders.fulfilled, (state, action: PayloadAction<CatalogOrderDTO[]>) => {
        state.orders = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<CatalogOrderDTO>) => {
        const idx = state.orders.findIndex(o => o.id === action.payload.id);
        if (idx >= 0) state.orders[idx] = action.payload;
      });
  },
});

export const { clearSelectedCatalog, clearCatalogError } = catalogSlice.actions;
export default catalogSlice.reducer;
