import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SectionTabBar } from '../../../components/SectionTabBar';
import { TransactionsPanel } from '../../transactions/components/TransactionsPanel';
import { ItemListScreen } from '../../items/screens/ItemListScreen';
import { ProvidersPanel } from '../../management/components/ProvidersPanel';
import { theme } from '../../../theme';

export type ExpenseTab = 'transactions' | 'items' | 'providers';

export const ExpenseScreen = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ExpenseTab>('transactions');
  const isFocused = useIsFocused();

  const TABS: { key: ExpenseTab; label: string }[] = [
    { key: 'transactions', label: t('section_tabs.transactions') },
    { key: 'items', label: t('section_tabs.items') },
    { key: 'providers', label: t('section_tabs.providers') },
  ];

  const isSectionActive = (section: ExpenseTab) => isFocused && tab === section;

  return (
    <View style={styles.container}>
      <SectionTabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'transactions' && (
        <TransactionsPanel type="EXPENSE" isActive={isSectionActive('transactions')} />
      )}
      {tab === 'items' && (
        <ItemListScreen fixedType="EXPENSE" isActive={isSectionActive('items')} />
      )}
      {tab === 'providers' && (
        <ProvidersPanel isActive={isSectionActive('providers')} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
});
