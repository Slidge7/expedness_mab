import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LANGUAGE_KEY = '@expedness/language';

export type AppLanguage = 'en' | 'ar';

export function getStoredLanguageSync(): AppLanguage | null {
  try {
    if (Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined') {
      const value = globalThis.localStorage.getItem(LANGUAGE_KEY);
      return value === 'en' || value === 'ar' ? value : null;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function getStoredLanguage(): Promise<AppLanguage | null> {
  const sync = getStoredLanguageSync();
  if (sync) return sync;

  try {
    const value = await AsyncStorage.getItem(LANGUAGE_KEY);
    return value === 'en' || value === 'ar' ? value : null;
  } catch {
    return null;
  }
}

export async function setStoredLanguage(lang: AppLanguage): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.setItem(LANGUAGE_KEY, lang);
      return;
    }
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // ignore persistence errors
  }
}
