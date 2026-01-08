import { create } from 'zustand';
import { storage } from '../utils/storage';

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  // Use a function to get initial value so it doesn't crash on load
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    storage.set('auth.token', token);
    storage.set('auth.user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    storage.delete('auth.token');
    storage.delete('auth.user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
