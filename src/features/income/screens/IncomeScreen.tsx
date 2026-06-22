import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SectionTabBar } from '../../../components/SectionTabBar';
import { TransactionsPanel } from '../../transactions/components/TransactionsPanel';
import { ItemListScreen } from '../../items/screens/ItemListScreen';
import { ClientsPanel } from '../../management/components/ClientsPanel';
import { theme } from '../../../theme';

export type IncomeTab = 'transactions' | 'items' | 'clients';

export const IncomeScreen = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<IncomeTab>('transactions');
  const isFocused = useIsFocused();

  const TABS: { key: IncomeTab; label: string }[] = [
    { key: 'transactions', label: t('section_tabs.transactions') },
    { key: 'items', label: t('section_tabs.items') },
    { key: 'clients', label: t('section_tabs.clients') },
  ];

  const isSectionActive = (section: IncomeTab) => isFocused && tab === section;

  return (
    <View style={styles.container}>
      <SectionTabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'transactions' && (
        <TransactionsPanel type="INCOME" isActive={isSectionActive('transactions')} />
      )}
      {tab === 'items' && (
        <ItemListScreen fixedType="INCOME" isActive={isSectionActive('items')} />
      )}
      {tab === 'clients' && (
        <ClientsPanel isActive={isSectionActive('clients')} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
});
