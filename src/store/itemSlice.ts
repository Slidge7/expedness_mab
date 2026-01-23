import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { itemService, ItemDTO } from '../features/items/api/itemService';

interface ItemState {
  items: ItemDTO[];
  loading: boolean;
}

const initialState: ItemState = {
  items: [],
  loading: false,
};

// Async Thunks
export const fetchItems = createAsyncThunk('items/fetchAll', async () => {
  return await itemService.getAll();
});

export const createItem = createAsyncThunk(
  'items/create',
  async (data: ItemDTO) => {
    return await itemService.create(data);
  },
);

const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(fetchItems.pending, state => {
        state.loading = true;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, state => {
        state.loading = false;
      })

      // Create (Optimistic Update)
      .addCase(createItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default itemSlice.reducer;
