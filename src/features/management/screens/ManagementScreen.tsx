import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  ManagementTabBar,
  ManagementTab,
} from '../components/ManagementTabBar';
import { ClientsPanel } from '../components/ClientsPanel';
import { ProvidersPanel } from '../components/ProvidersPanel';
import { MissionsPanel } from '../components/MissionsPanel';
import { LocationsPanel } from '../components/LocationsPanel';
import { StockPanel } from '../components/StockPanel';
import { MarquesPanel } from '../components/MarquesPanel';
import { CategoriesPanel } from '../components/CategoriesPanel';
import { CatalogsPanel } from '../components/CatalogsPanel';
import { ItemsPanel } from '../components/ItemsPanel';

export const ManagementScreen = () => {
  const [tab, setTab] = useState<ManagementTab>('clients');
  const isFocused = useIsFocused();

  return (
    <View style={styles.container}>
      <ManagementTabBar active={tab} onChange={setTab} />
      {tab === 'clients' && <ClientsPanel isActive={isFocused} />}
      {tab === 'providers' && <ProvidersPanel isActive={isFocused} />}
      {tab === 'missions' && <MissionsPanel isActive={isFocused} />}
      {tab === 'locations' && <LocationsPanel isActive={isFocused} />}
      {tab === 'marques' && <MarquesPanel isActive={isFocused} />}
      {tab === 'categories' && <CategoriesPanel isActive={isFocused} />}
      {tab === 'items' && <ItemsPanel isActive={isFocused} />}
      {tab === 'stock' && <StockPanel />}
      {tab === 'catalogs' && <CatalogsPanel isActive={isFocused} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
});
