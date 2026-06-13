import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { stockService, StockOperation } from '../features/stock/api/stockService';
import { ItemDTO } from '../features/items/api/itemService';

interface StockState {
  stockItems: ItemDTO[];
  loading: boolean;
  error: string | null;
}

const initialState: StockState = {
  stockItems: [],
  loading: false,
  error: null,
};

export const fetchStockItems = createAsyncThunk('stock/fetchAll', async () => {
  return await stockService.getAll();
});

export const fetchItemStock = createAsyncThunk(
  'stock/fetchByItem',
  async (itemId: number) => {
    return await stockService.getByItem(itemId);
  },
);

export const enableStock = createAsyncThunk(
  'stock/enable',
  async ({
    itemId,
    initialStock,
    minStock,
  }: {
    itemId: number;
    initialStock?: number | null;
    minStock?: number | null;
  }) => {
    return await stockService.enable(itemId, initialStock, minStock);
  },
);

export const disableStock = createAsyncThunk(
  'stock/disable',
  async (itemId: number) => {
    return await stockService.disable(itemId);
  },
);

export const adjustStock = createAsyncThunk(
  'stock/adjust',
  async ({
    itemId,
    quantity,
    operation,
  }: {
    itemId: number;
    quantity: number;
    operation: StockOperation;
  }) => {
    return await stockService.adjust(itemId, quantity, operation);
  },
);

function upsertStockItem(items: ItemDTO[], updated: ItemDTO): ItemDTO[] {
  const index = items.findIndex(i => i.id === updated.id);
  if (index === -1) return [...items, updated];
  const next = [...items];
  next[index] = updated;
  return next;
}

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchStockItems.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockItems.fulfilled, (state, action) => {
        state.loading = false;
        state.stockItems = action.payload;
      })
      .addCase(fetchStockItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stock items';
      })

      .addCase(enableStock.fulfilled, (state, action) => {
        state.stockItems = upsertStockItem(state.stockItems, action.payload);
      })

      .addCase(disableStock.fulfilled, (state, action) => {
        state.stockItems = state.stockItems.filter(i => i.id !== action.payload.id);
      })

      .addCase(adjustStock.fulfilled, (state, action) => {
        state.stockItems = upsertStockItem(state.stockItems, action.payload);
      })

      .addCase(fetchItemStock.fulfilled, (state, action) => {
        if (action.payload.stockEnabled) {
          state.stockItems = upsertStockItem(state.stockItems, action.payload);
        }
      });
  },
});

export default stockSlice.reducer;
