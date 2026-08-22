import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

const PRESET_TAGS = ['sale', 'featured', 'new', 'popular'];

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
}

export const TagsMultiSelect: React.FC<Props> = ({ value, onChange }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (!normalized) return;
    if (value.includes(normalized)) {
      onChange(value.filter(t => t !== normalized));
    } else {
      onChange([...value, normalized]);
    }
  };

  const addCustomTag = () => {
    const normalized = customTag.trim().toLowerCase();
    if (!normalized || value.includes(normalized)) {
      setCustomTag('');
      return;
    }
    onChange([...value, normalized]);
    setCustomTag('');
  };

  const allOptions = Array.from(new Set([...PRESET_TAGS, ...value]));

  return (
    <View style={styles.container}>
      <View style={styles.chipsRow}>
        {allOptions.map(tag => {
          const selected = value.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={customTag}
          onChangeText={setCustomTag}
          placeholder={t('items.add_tag_placeholder')}
          placeholderTextColor="#94A3B8"
          onSubmitEditing={addCustomTag}
          returnKeyType="done"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addCustomTag}>
          <Text style={styles.addBtnText}>{t('items.add_tag')}</Text>
        </TouchableOpacity>
      </View>

      {value.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={() => onChange([])}>
          <Text style={styles.clearText}>{t('items.clear_tags')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { gap: 10 },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: theme.colors.primary,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  clearBtn: { alignSelf: 'flex-start' },
  clearText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
});
