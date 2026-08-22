import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  categoryService,
  CategoryDTO,
} from '../../categories/api/categoryService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { createManagementStyles } from '../styles/managementStyles';
import { useTranslation } from 'react-i18next';

interface Props {
  isActive: boolean;
}

export const CategoriesPanel: React.FC<Props> = ({ isActive }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const s = createManagementStyles(theme);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [allItems, setAllItems] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    allItems.forEach(c => {
      if (c.categoryType?.trim()) types.add(c.categoryType.trim());
    });
    return Array.from(types).sort();
  }, [allItems]);

  const displayedItems = useMemo(() => {
    if (!typeFilter) return allItems;
    return allItems.filter(c => c.categoryType === typeFilter);
  }, [allItems, typeFilter]);

  const load = useCallback(async () => {
    try {
      setAllItems(await categoryService.getAll());
    } catch {
      Alert.alert(t('common.error'), t('management.load_categories_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    if (isActive) load();
  }, [isActive, load]);

  if (loading && isActive) {
    return (
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={s.panel}>
      {typeOptions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, !typeFilter && styles.filterChipActive]}
            onPress={() => setTypeFilter(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !typeFilter && styles.filterChipTextActive,
              ]}
            >
              {t('categories.all_types')}
            </Text>
          </TouchableOpacity>
          {typeOptions.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                typeFilter === type && styles.filterChipActive,
              ]}
              onPress={() => setTypeFilter(typeFilter === type ? null : type)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  typeFilter === type && styles.filterChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={displayedItems}
        keyExtractor={item => item.id?.toString() || item.name}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() =>
              navigation.navigate('CategoryDetail', { categoryId: item.id })
            }
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {item.imageSmall ? (
                <Image
                  source={{
                    uri: `data:image/jpeg;base64,${item.imageSmall}`,
                  }}
                  style={styles.thumb}
                />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Text style={styles.thumbLetter}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={s.cardHeader}>
                  <Text style={s.title}>{item.name}</Text>
                  {item.categoryType ? (
                    <Text style={s.badge}>{item.categoryType}</Text>
                  ) : null}
                </View>
                {item.tags ? (
                  <Text style={s.subtitle} numberOfLines={1}>
                    {item.tags}
                  </Text>
                ) : item.description ? (
                  <Text style={s.subtitle} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={s.emptyText}>{t('management.no_categories')}</Text>
        }
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateCategory')}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  filterRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginRight: 12,
  },
  thumbPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
  },
});
