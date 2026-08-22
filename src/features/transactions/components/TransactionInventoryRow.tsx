import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ItemDTO } from '../../items/api/itemService';
import { getItemImageSmallUri } from '../../items/utils/itemImageUtils';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';

interface Props {
  item: ItemDTO;
  quantity: number;
  onPress: () => void;
}

export const TransactionInventoryRow: React.FC<Props> = ({
  item,
  quantity,
  onPress,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const imageUri = getItemImageSmallUri(item.imageSmall);
  const selected = quantity > 0;

  return (
    <TouchableOpacity
      style={[styles.row, selected && styles.rowSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Text style={styles.thumbLetter}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.price}>${item.unitPrice?.toFixed(2) || '0.00'}</Text>
      </View>

      {selected ? (
        <View style={styles.qtyBadge}>
          <Text style={styles.qtyBadgeText}>{quantity}</Text>
        </View>
      ) : (
        <View style={styles.addChip}>
          <Text style={styles.addChipText}>{t('transaction.add_short')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.l,
    padding: theme.spacing.s,
    marginBottom: theme.spacing.s,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  rowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.m,
    marginRight: theme.spacing.m,
  },
  thumbPlaceholder: {
    backgroundColor: theme.colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  body: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  qtyBadge: {
    backgroundColor: theme.colors.primary,
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  qtyBadgeText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  addChip: {
    backgroundColor: theme.colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.m,
  },
  addChipText: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
