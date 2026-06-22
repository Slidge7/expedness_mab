import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../theme';
import { useTranslation } from 'react-i18next';

export const StockPanel: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>{t('management.stock_management')}</Text>
      <Text style={styles.subheading}>
        {t('management.track_quantities')}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('StockList')}
      >
        <Text style={styles.buttonIcon}>📦</Text>
        <View style={styles.buttonTextBlock}>
          <Text style={styles.buttonTitle}>{t('management.stock_overview')}</Text>
          <Text style={styles.buttonDesc}>
            {t('management.view_current_stock')}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  buttonIcon: { fontSize: 28, marginRight: 14 },
  buttonTextBlock: { flex: 1 },
  buttonTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  buttonDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
  chevron: { fontSize: 24, color: theme.colors.primary, fontWeight: '300' },
});
