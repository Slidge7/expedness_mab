import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchStockItems } from '../../../store/stockSlice';
import { ItemDTO } from '../../items/api/itemService';
import { getItemImageSmallUri } from '../../items/utils/itemImageUtils';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

function isLowStock(item: ItemDTO): boolean {
  if (item.minStock == null || item.currentStock == null) return false;
  return item.currentStock <= item.minStock;
}

export const StockListScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const { t } = useTranslation();
  const { stockItems, loading } = useAppSelector(state => state.stock);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    await dispatch(fetchStockItems());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePress = (item: ItemDTO) => {
    navigation.navigate('ItemStockDetail', { itemId: item.id });
  };

  const renderItem = ({ item }: { item: ItemDTO }) => {
    const low = isLowStock(item);
    const imageUri = getItemImageSmallUri(item.imageSmall);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardRow}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Text style={styles.thumbLetter}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              {low && (
                <View style={styles.lowBadge}>
                  <Text style={styles.lowBadgeText}>{t('stock.low')}</Text>
                </View>
              )}
            </View>

            <Text style={styles.category} numberOfLines={1}>
              {item.category || t('items.uncategorized')}
              {item.unit ? ` · ${item.unit}` : ''}
            </Text>

            <View style={styles.stockRow}>
              <Text style={[styles.stockQty, low && styles.stockQtyLow]}>
                {item.currentStock ?? 0}
              </Text>
              {item.minStock != null && (
                <Text style={styles.minStock}>
                  {t('stock.min_value', { value: item.minStock })}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && stockItems.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stockItems}
        keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>{t('stock.no_stock')}</Text>
            <Text style={styles.emptyText}>{t('stock.enable_hint')}</Text>
          </View>
        }
      />
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
  },
  thumbPlaceholder: {
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: '#64748B',
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  lowBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  category: { fontSize: 13, color: '#64748B', marginBottom: 10 },
  stockRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  stockQty: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  stockQtyLow: { color: '#DC2626' },
  minStock: { fontSize: 13, color: '#94A3B8' },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
});
