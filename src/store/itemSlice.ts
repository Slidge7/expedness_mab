import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/client';
import {
  itemService,
  ItemDTO,
  CreateItemData,
} from '../features/items/api/itemService';
import { Platform } from 'react-native';

interface ItemState {
  items: ItemDTO[];
  selectedItem: ItemDTO | null;
  loading: boolean;
  error: string | null;
}

const initialState: ItemState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Builds a multipart FormData compatible with Spring Boot's @RequestPart.
 *
 * The problem: React Native's FormData only accepts { uri, type, name }
 * objects or plain strings. Plain strings are sent without a Content-Type,
 * so Spring's @RequestPart (which requires application/json) rejects them.
 *
 * The solution: encode the JSON as a base64 data-URI. React Native's
 * network layer treats it as a file part and forwards the Content-Type
 * we specify, which is exactly what @RequestPart("item") needs.
 */
function buildItemFormData(data: object, imageFile?: any): FormData {
  const formData = new FormData();
  const json = JSON.stringify(data);

  if (Platform.OS === 'web') {
    // Web: use real Blob objects
    const jsonBlob = new Blob([json], { type: 'application/json' });
    formData.append('item', jsonBlob, 'item.json');

    if (imageFile) {
      if (imageFile.originalFile) {
        // originalFile is the real File object we stored in the stub
        formData.append(
          'image',
          imageFile.originalFile,
          imageFile.fileName || 'item-image.jpg',
        );
      } else {
        // fallback: fetch the blob from the object URL
        console.warn('No originalFile found on imageFile');
      }
    }
  } else {
    // Android/iOS: use React Native's { uri, type, name } trick
    const base64 = btoa(unescape(encodeURIComponent(json)));
    formData.append('item', {
      uri: `data:application/json;base64,${base64}`,
      type: 'application/json',
      name: 'item.json',
    } as any);

    if (imageFile) {
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || 'item-image.jpg',
      } as any);
    }
  }

  return formData;
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchItems = createAsyncThunk('items/fetchAll', async () => {
  return await itemService.getAll();
});

export const fetchItemById = createAsyncThunk(
  'items/fetchById',
  async (id: number) => {
    return await itemService.getById(id);
  },
);

/**
 * CREATE ITEM
 * Pass { data, imageFile? } — the thunk handles FormData construction.
 */
export const createItem = createAsyncThunk(
  'items/create',
  async (
    payload: { data: CreateItemData; imageFile?: any },
    { rejectWithValue },
  ) => {
    try {
      const formData = buildItemFormData(payload.data, payload.imageFile);

      const response = await apiClient.post<ItemDTO>(
        '/api/items/create',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        '[createItem] error:',
        error.response?.data ?? error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create item',
      );
    }
  },
);

/**
 * UPDATE ITEM (fields only)
 * Pass { id, data } — image is uploaded separately via uploadItemImage.
 */
export const updateItem = createAsyncThunk(
  'items/update',
  async (
    { id, data }: { id: number; data: CreateItemData },
    { rejectWithValue },
  ) => {
    try {
      const formData = buildItemFormData(data);

      const response = await apiClient.put<ItemDTO>(
        `/api/items/update/${id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        '[updateItem] error:',
        error.response?.data ?? error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update item',
      );
    }
  },
);

/**
 * UPLOAD ITEM IMAGE
 * Pass { id, imageFile } where imageFile is an asset from react-native-image-picker.
 */
export const uploadItemImage = createAsyncThunk(
  'items/uploadImage',
  async (
    { id, imageFile }: { id: number; imageFile: any },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        if (imageFile.originalFile) {
          formData.append(
            'image',
            imageFile.originalFile,
            imageFile.fileName || 'item-image.jpg',
          );
        }
      } else {
        formData.append('image', {
          uri: imageFile.uri,
          type: imageFile.type || 'image/jpeg',
          name: imageFile.fileName || 'item-image.jpg',
        } as any);
      }

      const response = await apiClient.post<ItemDTO>(
        `/api/items/${id}/upload-image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to upload image',
      );
    }
  },
);

export const deleteItem = createAsyncThunk(
  'items/delete',
  async (id: number) => {
    await itemService.delete(id);
    return id;
  },
);

export const deleteItemImage = createAsyncThunk(
  'items/deleteImage',
  async (id: number) => {
    return await itemService.deleteImage(id);
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearSelectedItem: state => {
      state.selectedItem = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchItems.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch items';
      })

      .addCase(fetchItemById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch item';
      })

      .addCase(createItem.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create item';
      })

      .addCase(updateItem.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          item => item.id === action.payload.id,
        );
        if (index !== -1) state.items[index] = action.payload;
        if (state.selectedItem?.id === action.payload.id)
          state.selectedItem = action.payload;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update item';
      })

      .addCase(uploadItemImage.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadItemImage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          item => item.id === action.payload.id,
        );
        if (index !== -1) state.items[index] = action.payload;
        if (state.selectedItem?.id === action.payload.id)
          state.selectedItem = action.payload;
      })
      .addCase(uploadItemImage.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to upload image';
      })

      .addCase(deleteItem.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload)
          state.selectedItem = null;
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete item';
      })

      .addCase(deleteItemImage.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItemImage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          item => item.id === action.payload.id,
        );
        if (index !== -1) state.items[index] = action.payload;
        if (state.selectedItem?.id === action.payload.id)
          state.selectedItem = action.payload;
      })
      .addCase(deleteItemImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete image';
      });
  },
});

export const { clearSelectedItem, clearError } = itemSlice.actions;
export default itemSlice.reducer;
