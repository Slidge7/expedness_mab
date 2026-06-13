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

export type PartyMode = 'none' | 'client' | 'provider';

interface Props {
  mode: PartyMode;
  clientId: number | null;
  providerId: number | null;
  clients: EntityOption[];
  providers: EntityOption[];
  onChange: (mode: PartyMode, clientId: number | null, providerId: number | null) => void;
}

export const TransactionPartyPicker: React.FC<Props> = ({
  mode,
  clientId,
  providerId,
  clients,
  providers,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedLabel = (() => {
    if (mode === 'client' && clientId != null) {
      return clients.find(c => c.id === clientId)?.label ?? 'Client';
    }
    if (mode === 'provider' && providerId != null) {
      return providers.find(p => p.id === providerId)?.label ?? 'Provider';
    }
    return 'None';
  })();

  const activeItems = mode === 'client' ? clients : mode === 'provider' ? providers : [];
  const filtered = query.trim()
    ? activeItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : activeItems;

  const handleModeChange = (next: PartyMode) => {
    if (next === 'none') {
      onChange('none', null, null);
    } else if (next === 'client') {
      onChange('client', clientId, null);
    } else {
      onChange('provider', null, providerId);
    }
  };

  const handleSelect = (id: number) => {
    if (mode === 'client') {
      onChange('client', id, null);
    } else if (mode === 'provider') {
      onChange('provider', null, id);
    }
    setQuery('');
    setOpen(false);
  };

  return (
    <>
      <View style={styles.modeRow}>
        {(['none', 'client', 'provider'] as const).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            onPress={() => handleModeChange(m)}
          >
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
              {m === 'none' ? 'None' : m === 'client' ? 'Client' : 'Provider'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode !== 'none' && (
        <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
          <Text style={styles.triggerText}>{selectedLabel}</Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>
      )}

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>
            Select {mode === 'client' ? 'Client' : 'Provider'}
          </Text>
          <TextInput
            style={styles.search}
            placeholder="Search..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
            keyboardShouldPersistTaps="always"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item.id)}
              >
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No matches found</Text>
            }
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 5 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  modeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modeText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  modeTextActive: { color: '#fff' },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 8,
    backgroundColor: '#FAFAFA',
  },
  triggerText: { fontSize: 15, color: '#334155', flex: 1 },
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
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemText: { fontSize: 15, color: '#334155' },
  empty: { textAlign: 'center', color: '#94A3B8', paddingVertical: 20 },
});
