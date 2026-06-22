import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import en from './locales/en.json';
import ar from './locales/ar.json';
import {
  getStoredLanguage,
  getStoredLanguageSync,
  type AppLanguage,
} from './languageStorage';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

function applyRtl(lang: AppLanguage) {
  const isRtl = lang === 'ar';
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(isRtl);
}

const initialLang: AppLanguage = getStoredLanguageSync() ?? 'en';
applyRtl(initialLang);

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export async function initLanguage(): Promise<void> {
  const lang = (await getStoredLanguage()) ?? 'en';
  applyRtl(lang);
  if (lang !== i18n.language) {
    await i18n.changeLanguage(lang);
  }
}

export default i18n;
