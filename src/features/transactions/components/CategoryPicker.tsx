import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  categoryService,
  CategoryDTO,
} from '../../categories/api/categoryService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

interface Props {
  value?: string;
  onChange: (name: string) => void;
  required?: boolean;
  categoryTypeFilter?: string;
}

export const CategoryPicker: React.FC<Props> = ({
  value,
  onChange,
  required = false,
  categoryTypeFilter,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadCategories();
  }, [open, categoryTypeFilter]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = categoryTypeFilter
        ? await categoryService.getByType(categoryTypeFilter)
        : await categoryService.getAll();
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = query.trim()
    ? categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : categories;

  const isNewValue =
    query.trim().length > 0 &&
    !categories.some(c => c.name.toLowerCase() === query.toLowerCase());

  const handleSelect = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      if (required && value) return;
      return;
    }

    const exists = categories.some(
      c => c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      try {
        const created = await categoryService.create({
          name: trimmed,
          categoryType: categoryTypeFilter,
        });
        setCategories(prev => [...prev, created]);
      } catch (e) {
        console.error('Failed to create category', e);
      }
    }

    onChange(trimmed);
    setQuery('');
    setOpen(false);
  };

  const selectedCategory = categories.find(
    c => c.name.toLowerCase() === value?.toLowerCase(),
  );

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <View style={styles.triggerContent}>
          {selectedCategory?.imageSmall ? (
            <Image
              source={{
                uri: `data:image/jpeg;base64,${selectedCategory.imageSmall}`,
              }}
              style={styles.triggerThumb}
            />
          ) : null}
          <Text style={value ? styles.triggerText : styles.triggerPlaceholder}>
            {value || t('transaction.select_category')}
          </Text>
        </View>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{t('transaction.category')}</Text>

          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('transaction.search_category')}
            placeholderTextColor="#94A3B8"
            autoFocus
          />

          {loading ? (
            <ActivityIndicator
              color={theme.colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={item => item.id?.toString() || item.name}
              style={styles.list}
              keyboardShouldPersistTaps="always"
              ListHeaderComponent={
                isNewValue ? (
                  <TouchableOpacity
                    style={styles.newItem}
                    onPress={() => handleSelect(query.trim())}
                  >
                    <Text style={styles.newItemLabel}>
                      {t('transaction.create_category')}
                    </Text>
                    <Text style={styles.newItemName}>"{query.trim()}"</Text>
                  </TouchableOpacity>
                ) : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    value === item.name && styles.itemActive,
                  ]}
                  onPress={() => handleSelect(item.name)}
                >
                  <View style={styles.itemRow}>
                    {item.imageSmall ? (
                      <Image
                        source={{
                          uri: `data:image/jpeg;base64,${item.imageSmall}`,
                        }}
                        style={styles.itemThumb}
                      />
                    ) : (
                      <View style={styles.itemThumbPlaceholder}>
                        <Text style={styles.itemThumbLetter}>
                          {item.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                      <Text
                        style={[
                          styles.itemText,
                          value === item.name && styles.itemTextActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.categoryType ? (
                        <Text style={styles.itemType}>{item.categoryType}</Text>
                      ) : null}
                    </View>
                  </View>
                  {value === item.name && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !isNewValue ? (
                  <Text style={styles.empty}>{t('transaction.no_categories')}</Text>
                ) : null
              }
            />
          )}
        </View>
      </Modal>
    </>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#F8FAFC',
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerThumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 10,
  },
  triggerText: { fontSize: 15, color: '#334155', flex: 1 },
  triggerPlaceholder: { fontSize: 15, color: '#94A3B8', flex: 1 },
  chevron: { color: '#94A3B8', fontSize: 14 },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  list: { flexGrow: 0 },
  newItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  newItemLabel: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  newItemName: { fontSize: 14, color: theme.colors.primary, fontWeight: '800' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemActive: { backgroundColor: '#F0FDF4' },
  itemRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
  },
  itemThumbPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemThumbLetter: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  itemInfo: { flex: 1 },
  itemText: { fontSize: 15, color: '#334155' },
  itemTextActive: { color: theme.colors.primary, fontWeight: '700' },
  itemType: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  check: { color: theme.colors.primary, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#94A3B8', paddingVertical: 20 },
});
