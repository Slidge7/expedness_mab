import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { lightTheme, darkTheme, type AppTheme } from './index';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = AppTheme & {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = 'expedness_theme_mode';

const getStoredThemeMode = (): ThemeMode => {
  if (Platform.OS === 'web') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}
  }
  return 'light';
};

const storeThemeMode = (mode: ThemeMode) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }
};

const ThemeContext = createContext<ThemeContextValue>({
  ...lightTheme,
  themeMode: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredThemeMode);

  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    storeThemeMode(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  // Sync the HTML background color on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.style.backgroundColor = currentTheme.colors.background;
      document.body.style.backgroundColor = currentTheme.colors.background;
    }
  }, [currentTheme]);

  const value: ThemeContextValue = {
    ...currentTheme,
    themeMode,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
