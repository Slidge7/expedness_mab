import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchItems, deleteItem } from '../../../store/itemSlice';
import { theme } from '../../../theme';
import { ItemDTO } from '../api/itemService';

const { width } = Dimensions.get('window');

type ViewMode = 'list' | 'grid';

export const ItemListScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(state => state.items);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>(
    'ALL',
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchItems());
    setRefreshing(false);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleItemPress = (item: ItemDTO) => {
    navigation.navigate('ItemDetail', { itemId: item.id });
  };

  const renderListItem = ({ item }: { item: ItemDTO }) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.listCardContent}>
        {/* Image */}
        <View style={styles.listImageContainer}>
          {item.imageSmall ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.imageSmall}` }}
              style={styles.listImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.listDetails}>
          <View style={styles.listHeader}>
            <Text style={styles.listName} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    item.type === 'INCOME' ? '#D1FAE5' : '#FEE2E2',
                },
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  { color: item.type === 'INCOME' ? '#065F46' : '#991B1B' },
                ]}
              >
                {item.type}
              </Text>
            </View>
          </View>

          <Text style={styles.listCategory} numberOfLines={1}>
            {item.category || 'Uncategorized'}{' '}
            {item.unit ? `• ${item.unit}` : ''}
          </Text>

          <View style={styles.listFooter}>
            <Text style={styles.listPrice}>${item.unitPrice?.toFixed(2)}</Text>
            {!item.active && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactive</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: ItemDTO }) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.gridImageContainer}>
        {item.imageSmall ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.imageSmall}` }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.gridImage, styles.placeholderImage]}>
            <Text style={styles.placeholderTextLarge}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Type Badge Overlay */}
        <View
          style={[
            styles.gridTypeBadge,
            { backgroundColor: item.type === 'INCOME' ? '#10B981' : '#EF4444' },
          ]}
        >
          <Text style={styles.gridTypeBadgeText}>
            {item.type === 'INCOME' ? '↑' : '↓'}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.gridDetails}>
        <Text style={styles.gridName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.gridCategory} numberOfLines={1}>
          {item.category || 'Uncategorized'}
        </Text>
        <Text style={styles.gridPrice}>${item.unitPrice?.toFixed(2)}</Text>

        {!item.active && (
          <View style={styles.gridInactiveBadge}>
            <Text style={styles.inactiveBadgeText}>Inactive</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Controls */}
      <View style={styles.headerControls}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter & View Toggle */}
        <View style={styles.controlRow}>
          {/* Type Filter */}
          <View style={styles.filterButtons}>
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setFilterType(type)}
                style={[
                  styles.filterBtn,
                  filterType === type && styles.filterBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    filterType === type && styles.filterBtnTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={[
                styles.viewToggleBtn,
                viewMode === 'list' && styles.viewToggleBtnActive,
              ]}
            >
              <Text style={styles.viewToggleIcon}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('grid')}
              style={[
                styles.viewToggleBtn,
                viewMode === 'grid' && styles.viewToggleBtnActive,
              ]}
            >
              <Text style={styles.viewToggleIcon}>⊞</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Items List/Grid */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No items found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? 'Try adjusting your search'
              : 'Create your first item to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={viewMode === 'list' ? renderListItem : renderGridItem}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when changing view mode
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      {/* FAB to Add Item */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateItem')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header Controls
  headerControls: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  clearIcon: {
    fontSize: 18,
    color: '#94A3B8',
    paddingHorizontal: 8,
  },

  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  filterButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterBtnTextActive: {
    color: '#FFF',
  },

  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  viewToggleBtn: {
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  viewToggleBtnActive: {
    backgroundColor: '#FFF',
  },
  viewToggleIcon: {
    fontSize: 16,
  },

  // List View
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  listCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  listCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  listImageContainer: {
    marginRight: 12,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#94A3B8',
  },
  placeholderTextLarge: {
    fontSize: 48,
    fontWeight: '700',
    color: '#94A3B8',
  },
  listDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  listCategory: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  inactiveBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },

  // Grid View
  gridRow: {
    justifyContent: 'space-between',
  },
  gridCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    width: (width - 48) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 140,
  },
  gridTypeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTypeBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  gridDetails: {
    padding: 12,
  },
  gridName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    minHeight: 36,
  },
  gridCategory: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  gridPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  gridInactiveBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },

  // States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
  },
});
