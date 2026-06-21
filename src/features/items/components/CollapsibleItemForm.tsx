import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ItemFormPanel } from './ItemFormPanel';
import { ItemDTO, TransactionType } from '../api/itemService';
import { theme } from '../../../theme';

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
  const isEdit = !!editItem;
  const typeLabel = itemType === 'INCOME' ? 'Income' : 'Expense';

  const headerTitle = isEdit
    ? `Edit: ${editItem?.name}`
    : `New ${typeLabel} Item`;

  return (
    <View style={styles.wrapper}>
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
          <Text style={styles.headerAction}>Tap to add</Text>
        )}
      </TouchableOpacity>

      {expanded && (
        <ItemFormPanel
          itemType={isEdit ? editItem!.type : itemType}
          editItem={editItem}
          onSaved={onSaved}
          onCancel={onCancel}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
