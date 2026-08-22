import React, { useEffect, useState } from 'react';
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
import { marqueService, MarqueDTO } from '../../marques/api/marqueService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

interface Props {
  value?: number | null;
  onChange: (marqueId: number | null, marqueTitle?: string) => void;
}

export const MarquePicker: React.FC<Props> = ({ value, onChange }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [marques, setMarques] = useState<MarqueDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | undefined>();

  useEffect(() => {
    if (open) loadMarques();
  }, [open]);

  useEffect(() => {
    if (value == null) {
      setSelectedTitle(undefined);
      return;
    }
    const match = marques.find(m => m.id === value);
    if (match) {
      setSelectedTitle(match.title);
    }
  }, [value, marques]);

  const loadMarques = async () => {
    try {
      setLoading(true);
      const data = await marqueService.getAll();
      setMarques(data);
      if (value != null) {
        const match = data.find(m => m.id === value);
        if (match) setSelectedTitle(match.title);
      }
    } catch (e) {
      console.error('Failed to load marques', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = query.trim()
    ? marques.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase()),
      )
    : marques;

  const handleSelect = (marque: MarqueDTO | null) => {
    if (marque?.id != null) {
      onChange(marque.id, marque.title);
      setSelectedTitle(marque.title);
    } else {
      onChange(null);
      setSelectedTitle(undefined);
    }
    setQuery('');
    setOpen(false);
  };

  const displayText =
    value != null && selectedTitle
      ? selectedTitle
      : t('items.select_marque');

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={value != null ? styles.triggerText : styles.triggerPlaceholder}>
          {displayText}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      {value != null && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => handleSelect(null)}
        >
          <Text style={styles.clearText}>{t('items.clear_marque')}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{t('items.marque')}</Text>

          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('items.search_marque')}
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
              keyExtractor={item => item.id?.toString() || item.title}
              style={styles.list}
              keyboardShouldPersistTaps="always"
              ListHeaderComponent={
                value != null ? (
                  <TouchableOpacity
                    style={styles.clearItem}
                    onPress={() => handleSelect(null)}
                  >
                    <Text style={styles.clearItemText}>{t('items.no_marque')}</Text>
                  </TouchableOpacity>
                ) : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    value === item.id && styles.itemActive,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  {item.imageSmall ? (
                    <Image
                      source={{
                        uri: `data:image/jpeg;base64,${item.imageSmall}`,
                      }}
                      style={styles.thumb}
                    />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                      <Text style={styles.thumbLetter}>
                        {item.title.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.itemContent}>
                    <Text
                      style={[
                        styles.itemText,
                        value === item.id && styles.itemTextActive,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.type ? (
                      <Text style={styles.itemMeta}>{item.type}</Text>
                    ) : null}
                  </View>
                  {value === item.id && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>{t('items.no_marques')}</Text>
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
  triggerText: { fontSize: 15, color: '#334155', flex: 1 },
  triggerPlaceholder: { fontSize: 15, color: '#94A3B8', flex: 1 },
  chevron: { color: '#94A3B8', fontSize: 14 },
  clearBtn: { marginTop: 6, alignSelf: 'flex-start' },
  clearText: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },
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
  clearItem: {
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  clearItemText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemActive: { backgroundColor: '#F0FDF4' },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 10,
  },
  thumbPlaceholder: {
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLetter: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  itemContent: { flex: 1 },
  itemText: { fontSize: 15, color: '#334155' },
  itemTextActive: { color: theme.colors.primary, fontWeight: '700' },
  itemMeta: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  check: { color: theme.colors.primary, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#94A3B8', paddingVertical: 20 },
});
