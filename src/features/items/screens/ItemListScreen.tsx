import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchItems } from '../../../store/itemSlice';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { ItemDTO, TransactionType } from '../api/itemService';
import { useTranslation } from 'react-i18next';
import { translateTransactionType } from '../../../i18n/helpers';
import { CollapsibleItemForm } from '../components/CollapsibleItemForm';
import { DEFAULT_ITEM_CATEGORY } from '../constants';
import { getItemImageSmallUri } from '../utils/itemImageUtils';
import { marqueService, MarqueDTO } from '../../marques/api/marqueService';

type ViewMode = 'list' | 'grid';

interface ItemListScreenProps {
  fixedType?: 'INCOME' | 'EXPENSE';
  isActive?: boolean;
  showMarqueCategoryFilters?: boolean;
}

export const ItemListScreen = ({
  fixedType,
  isActive = true,
  showMarqueCategoryFilters = false,
}: ItemListScreenProps = {}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { items, loading } = useAppSelector(state => state.items);

  const formatCategory = (category?: string) => {
    if (!category || category === DEFAULT_ITEM_CATEGORY) return t('items.other');
    return category;
  };

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>(
    fixedType ?? 'ALL',
  );
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterMarqueId, setFilterMarqueId] = useState<number | null>(null);
  const [marques, setMarques] = useState<MarqueDTO[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [formExpanded, setFormExpanded] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDTO | null>(null);

  const resolveCreateItemType = (): TransactionType => {
    if (fixedType) return fixedType;
    if (filterType === 'INCOME') return 'INCOME';
    if (filterType === 'EXPENSE') return 'EXPENSE';
    return 'EXPENSE';
  };

  useEffect(() => {
    if (isActive) dispatch(fetchItems());
  }, [dispatch, isActive]);

  const loadMarques = useCallback(async () => {
    if (!showMarqueCategoryFilters) return;
    try {
      setMarques(await marqueService.getAll());
    } catch {
      // filters still work from item marque titles
    }
  }, [showMarqueCategoryFilters]);

  useEffect(() => {
    if (isActive && showMarqueCategoryFilters) loadMarques();
  }, [isActive, showMarqueCategoryFilters, loadMarques]);

  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(item => {
      cats.add(item.category?.trim() || DEFAULT_ITEM_CATEGORY);
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const marqueOptions = useMemo(() => {
    const map = new Map<number, string>();
    marques.forEach(m => {
      if (m.id != null) map.set(m.id, m.title);
    });
    items.forEach(item => {
      if (item.marqueId != null && item.marqueTitle) {
        map.set(item.marqueId, item.marqueTitle);
      }
    });
    return Array.from(map.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items, marques]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchItems());
    if (showMarqueCategoryFilters) await loadMarques();
    setRefreshing(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.marqueTitle?.toLowerCase().includes(q) ||
        item.tags?.some(tag => tag.toLowerCase().includes(q));
      const effectiveType = fixedType ?? filterType;
      const matchesType = effectiveType === 'ALL' || item.type === effectiveType;
      const itemCategory = item.category?.trim() || DEFAULT_ITEM_CATEGORY;
      const matchesCategory =
        !filterCategory || itemCategory === filterCategory;
      const matchesMarque =
        filterMarqueId == null || item.marqueId === filterMarqueId;
      return matchesSearch && matchesType && matchesCategory && matchesMarque;
    });
  }, [items, searchQuery, filterType, fixedType, filterCategory, filterMarqueId]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormExpanded(true);
  };

  const openEditForm = (item: ItemDTO) => {
    setEditingItem(item);
    setFormExpanded(true);
  };

  const closeForm = () => {
    setFormExpanded(false);
    setEditingItem(null);
  };

  const handleFormSaved = async () => {
    closeForm();
    await dispatch(fetchItems());
  };

  const handleItemPress = (item: ItemDTO) => {
    openEditForm(item);
  };

  const handleItemDetailPress = (item: ItemDTO) => {
    navigation.navigate('ItemDetail', { itemId: item.id });
  };

  const renderListItem = ({ item }: { item: ItemDTO }) => {
    const imageUri = getItemImageSmallUri(item.imageSmall);
    return (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.listCardContent}>
        {/* Image */}
        <View style={styles.listImageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
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
                    item.type === 'INCOME' ? theme.colors.successLight : theme.colors.dangerLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  { color: item.type === 'INCOME' ? '#065F46' : '#991B1B' },
                ]}
              >
                {translateTransactionType(t, item.type)}
              </Text>
            </View>
          </View>

          <Text style={styles.listCategory} numberOfLines={1}>
            {formatCategory(item.category)}{' '}
            {item.unit ? `• ${item.unit}` : ''}
            {item.marqueTitle ? ` • ${item.marqueTitle}` : ''}
          </Text>

          {item.tags && item.tags.length > 0 && (
            <Text style={styles.listTags} numberOfLines={1}>
              {item.tags.join(' · ')}
            </Text>
          )}

          <View style={styles.listFooter}>
            <Text style={styles.listPrice}>${item.unitPrice?.toFixed(2)}</Text>
            <View style={styles.listBadges}>
              {item.stockEnabled && (
                <View style={styles.stockBadge}>
                  <Text style={styles.stockBadgeText}>
                    {t('items.in_stock', { count: item.currentStock ?? 0 })}
                  </Text>
                </View>
              )}
              {!item.active && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>{t('items.inactive')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => handleItemDetailPress(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.detailBtnText}>⋯</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    );
  };

  const renderGridItem = ({ item }: { item: ItemDTO }) => {
    const imageUri = getItemImageSmallUri(item.imageSmall);
    return (
    <TouchableOpacity
      style={[styles.gridCard, { width: (width - 48) / 2 }]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.gridImageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
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
          {formatCategory(item.category)}
          {item.marqueTitle ? ` • ${item.marqueTitle}` : ''}
        </Text>
        <Text style={styles.gridPrice}>${item.unitPrice?.toFixed(2)}</Text>

        {!item.active && (
          <View style={styles.gridInactiveBadge}>
            <Text style={styles.inactiveBadgeText}>{t('items.inactive')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Controls */}
      <View style={styles.headerControls}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('items.search_placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter & View Toggle */}
        <View style={styles.controlRow}>
          {!fixedType && (
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
                    {translateTransactionType(t, type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.viewToggle, fixedType && styles.viewToggleEnd]}>
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

        {showMarqueCategoryFilters && categoryOptions.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipRow}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                !filterCategory && styles.filterChipActive,
              ]}
              onPress={() => setFilterCategory(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !filterCategory && styles.filterChipTextActive,
                ]}
              >
                {t('management.all_categories')}
              </Text>
            </TouchableOpacity>
            {categoryOptions.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  filterCategory === cat && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilterCategory(filterCategory === cat ? null : cat)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterCategory === cat && styles.filterChipTextActive,
                  ]}
                >
                  {formatCategory(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {showMarqueCategoryFilters && marqueOptions.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipRow}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterMarqueId == null && styles.filterChipActive,
              ]}
              onPress={() => setFilterMarqueId(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterMarqueId == null && styles.filterChipTextActive,
                ]}
              >
                {t('management.all_marques')}
              </Text>
            </TouchableOpacity>
            {marqueOptions.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.filterChip,
                  filterMarqueId === m.id && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilterMarqueId(filterMarqueId === m.id ? null : m.id)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterMarqueId === m.id && styles.filterChipTextActive,
                  ]}
                >
                  {m.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <CollapsibleItemForm
        expanded={formExpanded}
        onToggle={() => {
          if (formExpanded) {
            closeForm();
          } else {
            openCreateForm();
          }
        }}
        itemType={resolveCreateItemType()}
        editItem={editingItem}
        onSaved={handleFormSaved}
        onCancel={closeForm}
      />

      {/* Items List/Grid — hidden while form is open so create/edit can scroll */}
      {!formExpanded &&
        (loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>{t('items.no_items_found')}</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? t('items.adjust_search')
                : t('items.create_first')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item, index) =>
              item.id?.toString() ?? `fallback-${index}`
            }
            renderItem={viewMode === 'list' ? renderListItem : renderGridItem}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode}
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
        ))}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header Controls
  headerControls: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.secondary,
  },
  clearIcon: {
    fontSize: 18,
    color: theme.colors.textSecondary,
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

  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFF',
  },

  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  viewToggleEnd: {
    marginLeft: 'auto',
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
    paddingBottom: 24,
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
    alignItems: 'center',
    padding: 12,
  },
  detailBtn: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  detailBtnText: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '700',
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
    marginBottom: 4,
  },
  listTags: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
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
});
