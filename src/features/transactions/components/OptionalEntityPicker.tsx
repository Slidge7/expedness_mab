import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';

export interface EntityOption {
  id: number;
  label: string;
}

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
  items: EntityOption[];
  title: string;
  placeholder?: string;
}

const NONE_LABEL = '-- None --';

export const OptionalEntityPicker: React.FC<Props> = ({
  value,
  onChange,
  items,
  title,
  placeholder = NONE_LABEL,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const selectedLabel =
    value != null ? items.find(i => i.id === value)?.label : undefined;

  const handleSelect = (id: number | null) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text
          style={selectedLabel ? styles.triggerText : styles.triggerPlaceholder}
        >
          {selectedLabel ?? placeholder}
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

          <FlatList
            data={items}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
            keyboardShouldPersistTaps="always"
            ListHeaderComponent={
              <TouchableOpacity
                style={[styles.item, value == null && styles.itemActive]}
                onPress={() => handleSelect(null)}
              >
                <Text
                  style={[
                    styles.itemText,
                    value == null && styles.itemTextActive,
                  ]}
                >
                  {NONE_LABEL}
                </Text>
                {value == null && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.item,
                  value === item.id && styles.itemActive,
                ]}
                onPress={() => handleSelect(item.id)}
              >
                <Text
                  style={[
                    styles.itemText,
                    value === item.id && styles.itemTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {value === item.id && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>{t('common.no_options')}</Text>
            }
          />
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
  list: { flexGrow: 0 },
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
