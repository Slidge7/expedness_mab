import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ItemFormPanel } from './ItemFormPanel';
import { ItemDTO, TransactionType } from '../api/itemService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { translateTransactionType } from '../../../i18n/helpers';

interface CollapsibleItemFormProps {
  expanded: boolean;
  onToggle: () => void;
  itemType: TransactionType;
  editItem?: ItemDTO | null;
  onSaved: () => void;
  onCancel: () => void;
}

export const CollapsibleItemForm: React.FC<CollapsibleItemFormProps> = ({
  expanded,
  onToggle,
  itemType,
  editItem,
  onSaved,
  onCancel,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const isEdit = !!editItem;
  const typeLabel = translateTransactionType(t, itemType);

  const headerTitle = isEdit
    ? t('items.edit_name', { name: editItem?.name })
    : t('items.new_type_item', { type: typeLabel });

  return (
    <View style={[styles.wrapper, expanded && styles.wrapperExpanded]}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>{expanded ? '▾' : '▸'}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
        </View>
        {!expanded && !isEdit && (
          <Text style={styles.headerAction}>{t('items.tap_to_add')}</Text>
        )}
      </TouchableOpacity>

      {expanded && (
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formScrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          <ItemFormPanel
            itemType={isEdit ? editItem!.type : itemType}
            editItem={editItem}
            onSaved={onSaved}
            onCancel={onCancel}
          />
        </ScrollView>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  wrapperExpanded: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerIcon: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerAction: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },
});
