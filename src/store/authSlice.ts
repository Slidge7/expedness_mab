import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from '../features/auth/types';

// Define the State Shape
interface AuthState {
  user: { username: string; email?: string; id?: number } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean; // Tracks if we finished checking storage
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
};

// ─── THUNKS (Async Actions) ───

// 1. Initialize: Check storage when app starts
export const loadUserSession = createAsyncThunk(
  'auth/loadSession',
  async () => {
    const token = await AsyncStorage.getItem('auth.token');
    const userStr = await AsyncStorage.getItem('auth.user');
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) };
    }
    return null;
  },
);

// 2. Login: Save data after successful API call
export const loginSuccess = createAsyncThunk(
  'auth/loginSuccess',
  async (data: AuthResponse) => {
    await AsyncStorage.setItem('auth.token', data.token);
    await AsyncStorage.setItem(
      'auth.user',
      JSON.stringify({
        username: data.username,
        email: data.email,
        id: data.id,
      }),
    );
    return data;
  },
);

// 3. Logout: Clear data
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('auth.token');
  await AsyncStorage.removeItem('auth.user');
});

// ─── SLICE ───
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {}, // We use extraReducers for Thunks
  extraReducers: builder => {
    // Load Session
    builder.addCase(loadUserSession.fulfilled, (state, action) => {
      if (action.payload) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      }
      state.isHydrated = true; // App is ready to render
    });

    // Login
    builder.addCase(loginSuccess.fulfilled, (state, action) => {
      state.user = {
        username: action.payload.username,
        email: action.payload.email,
        id: action.payload.id,
      };
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export default authSlice.reducer;
