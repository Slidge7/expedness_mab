import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { categoryService, CategoryDTO } from '../api/categoryService';
import { theme } from '../../../theme';

interface Props {
  value?: string;
  onChange: (name: string) => void;
}

export const CategoryPicker: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadCategories();
  }, [open]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
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

  const handleSelect = (name: string) => {
    onChange(name);
    setQuery('');
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={value ? styles.triggerText : styles.triggerPlaceholder}>
          {value || 'Select or type a category'}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Category</Text>

          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search or type new category…"
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
                    <Text style={styles.newItemLabel}>+ Create </Text>
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
                  <Text
                    style={[
                      styles.itemText,
                      value === item.name && styles.itemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {value === item.name && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !isNewValue ? (
                  <Text style={styles.empty}>No categories found</Text>
                ) : null
              }
            />
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 5,
    backgroundColor: '#FAFAFA',
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
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemActive: { backgroundColor: '#F0FDF4' },
  itemText: { fontSize: 15, color: '#334155' },
  itemTextActive: { color: theme.colors.primary, fontWeight: '700' },
  check: { color: theme.colors.primary, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#94A3B8', paddingVertical: 20 },
});
