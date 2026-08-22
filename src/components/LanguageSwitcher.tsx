import React from 'react';
import { TouchableOpacity, Text, StyleSheet, I18nManager, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import type { AppTheme } from '../theme';
import { setStoredLanguage, type AppLanguage } from '../i18n/languageStorage';

export const LanguageSwitcher = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t, i18n } = useTranslation();

  const toggleLanguage = async () => {
    const newLang: AppLanguage = i18n.language === 'ar' ? 'en' : 'ar';
    const isNewLangRTL = newLang === 'ar';

    await setStoredLanguage(newLang);
    await i18n.changeLanguage(newLang);

    I18nManager.forceRTL(isNewLangRTL);
    I18nManager.allowRTL(true);

    if (Platform.OS === 'web') {
      globalThis.location.reload();
    }
  };

  const isRTL = I18nManager.isRTL;

  return (
    <TouchableOpacity onPress={toggleLanguage} style={styles.container}>
      <Text style={styles.text}>
        {isRTL ? t('language.english') : t('language.arabic')}
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.m,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
