import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createCatalog, updateCatalog } from '../../../store/catalogSlice';
import { fetchItems } from '../../../store/itemSlice';
import { ContactType, CreateCatalogData } from '../api/catalogService';
import { contactTypeLabel, contactValuePlaceholder } from '../utils/contactLinks';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';

const CONTACT_TYPES: ContactType[] = ['WHATSAPP', 'TELEGRAM', 'MESSENGER'];

interface Props {
  catalogId?: number;
  initial?: {
    name: string;
    description: string;
    contactType: ContactType;
    contactValue: string;
    active: boolean;
    itemIds: number[];
  };
}

export const CatalogFormScreen: React.FC<Props> = ({ catalogId, initial }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(state => state.items);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [contactType, setContactType] = useState<ContactType>(
    initial?.contactType || 'WHATSAPP',
  );
  const [contactValue, setContactValue] = useState(initial?.contactValue || '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>(
    initial?.itemIds || [],
  );

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const toggleItem = (itemId: number) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Catalog name is required');
      return;
    }
    if (!contactValue.trim()) {
      Alert.alert('Error', 'Contact value is required');
      return;
    }
    if (selectedItemIds.length === 0) {
      Alert.alert('Error', 'Select at least one item');
      return;
    }

    const data: CreateCatalogData = {
      name: name.trim(),
      description: description.trim() || undefined,
      contactType,
      contactValue: contactValue.trim(),
      active,
      itemIds: selectedItemIds,
    };

    setSaving(true);
    try {
      if (catalogId) {
        await dispatch(updateCatalog({ id: catalogId, data })).unwrap();
      } else {
        await dispatch(createCatalog(data)).unwrap();
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save catalog');
    } finally {
      setSaving(false);
    }
  };

  const incomeItems = items.filter(i => i.active !== false && i.type === 'INCOME');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Summer menu"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="Optional description for clients"
        multiline
      />

      <Text style={styles.label}>Submit via *</Text>
      <View style={styles.chipRow}>
        {CONTACT_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, contactType === type && styles.chipActive]}
            onPress={() => setContactType(type)}
          >
            <Text
              style={[
                styles.chipText,
                contactType === type && styles.chipTextActive,
              ]}
            >
              {contactTypeLabel(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Contact *</Text>
      <TextInput
        style={styles.input}
        value={contactValue}
        onChangeText={setContactValue}
        placeholder={contactValuePlaceholder(contactType)}
        autoCapitalize="none"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Active</Text>
        <Switch value={active} onValueChange={setActive} />
      </View>

      <Text style={styles.label}>Items * ({selectedItemIds.length} selected)</Text>
      {incomeItems.length === 0 ? (
        <Text style={styles.hint}>No active income items. Add products first.</Text>
      ) : (
        incomeItems.map(item => {
          const selected = item.id != null && selectedItemIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, selected && styles.itemRowSelected]}
              onPress={() => item.id && toggleItem(item.id)}
            >
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.unitPrice?.toFixed(2)}</Text>
              <Text style={styles.check}>{selected ? '✓' : ''}</Text>
            </TouchableOpacity>
          );
        })
      )}

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>
            {catalogId ? 'Update catalog' : 'Create catalog'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { padding: 16, paddingBottom: 40 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: theme.colors.primary },
  chipText: { fontWeight: '600', color: '#64748B' },
  chipTextActive: { color: '#fff' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  itemName: { flex: 1, fontWeight: '600', color: '#0F172A' },
  itemPrice: { color: '#64748B', marginRight: 8 },
  check: { width: 20, fontWeight: '700', color: theme.colors.primary },
  hint: { color: '#64748B', fontStyle: 'italic' },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
