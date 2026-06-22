import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../../../theme';

import { useTranslation } from 'react-i18next';

export type ManagementTab = 'clients' | 'providers' | 'missions' | 'locations' | 'stock';

interface Props {
  active: ManagementTab;
  onChange: (tab: ManagementTab) => void;
}

export const ManagementTabBar: React.FC<Props> = ({ active, onChange }) => {
  const { t } = useTranslation();

  const TABS: { key: ManagementTab; label: string }[] = [
    { key: 'clients', label: t('management.clients') },
    { key: 'providers', label: t('management.providers') },
    { key: 'missions', label: t('management.missions') },
    { key: 'locations', label: t('management.locations') },
    { key: 'stock', label: t('management.stock') },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {TABS.map(tab => {
          const selected = active === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selected && styles.tabActive]}
              onPress={() => onChange(tab.key)}
            >
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#fff',
  },
});
