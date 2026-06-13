import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { theme } from '../../../theme';
import { EntityOption } from './OptionalEntityPicker';

interface Props {
  value: number[];
  onChange: (ids: number[]) => void;
  items: EntityOption[];
  title?: string;
  placeholder?: string;
}

export const MultiProviderPicker: React.FC<Props> = ({
  value,
  onChange,
  items,
  title = 'Providers',
  placeholder = 'Select providers (optional)',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedLabels = items
    .filter(i => value.includes(i.id))
    .map(i => i.label);

  const displayText =
    selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder;

  const filtered = query.trim()
    ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text
          style={
            selectedLabels.length > 0
              ? styles.triggerText
              : styles.triggerPlaceholder
          }
          numberOfLines={2}
        >
          {displayText}
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
          <Text style={styles.sheetTitle}>{title}</Text>
          <TextInput
            style={styles.search}
            placeholder="Search..."
            value={query}
            onChangeText={setQuery}
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
            keyboardShouldPersistTaps="always"
            renderItem={({ item }) => {
              const selected = value.includes(item.id);
              return (
                <TouchableOpacity
                  style={[styles.item, selected && styles.itemActive]}
                  onPress={() => toggle(item.id)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      selected && styles.itemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selected && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>No providers available</Text>
            }
          />
          <TouchableOpacity style={styles.doneBtn} onPress={() => setOpen(false)}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
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
    marginBottom: 10,
  },
  search: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  list: { flexGrow: 0 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemActive: { backgroundColor: '#F0FDF4' },
  itemText: { fontSize: 15, color: '#334155' },
  itemTextActive: { color: theme.colors.primary, fontWeight: '700' },
  check: { color: theme.colors.primary, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#94A3B8', paddingVertical: 20 },
  doneBtn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  doneText: { color: '#fff', fontWeight: '700' },
});
