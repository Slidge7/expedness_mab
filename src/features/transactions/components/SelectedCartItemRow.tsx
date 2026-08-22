import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { TransactionItemDTO, DiscountType } from '../api/transactionService';
import { DiscountField } from './DiscountField';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';

interface Props {
  item: TransactionItemDTO & { discountValueInput?: string };
  displayName: string;
  imageUri?: string | null;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
  lineTotal?: number;
  onDiscountChange: (type: DiscountType | null, value: string) => void;
}

const CONFIRM_MS = 3000;

export const SelectedCartItemRow: React.FC<Props> = ({
  item,
  displayName,
  imageUri,
  onDecrement,
  onIncrement,
  onRemove,
  lineTotal = item.quantity * item.unitPrice,
  onDiscountChange,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subtotal = item.quantity * item.unitPrice;
  const hasDiscount =
    item.discountType != null &&
    item.discountValue != null &&
    item.discountValue > 0;

  useEffect(() => {
    if (!confirmRemove) {
      loopRef.current?.stop();
      bounceAnim.setValue(1);
      return;
    }

    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.18,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    );
    loopRef.current.start();

    timeoutRef.current = setTimeout(() => {
      setConfirmRemove(false);
    }, CONFIRM_MS);

    return () => {
      loopRef.current?.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [confirmRemove, bounceAnim]);

  const handleRemovePress = () => {
    if (confirmRemove) {
      setConfirmRemove(false);
      onRemove();
    } else {
      setConfirmRemove(true);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={styles.thumbLetter}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {displayName}
          </Text>
          <Text style={styles.price}>${item.unitPrice.toFixed(2)} / ea</Text>
        </View>

        <View style={styles.controlsWrapper}>
          <View style={styles.quantityControls}>
            <TouchableOpacity onPress={onDecrement} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity onPress={onIncrement} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.priceContainer}>
            {hasDiscount && (
              <Text style={styles.originalSubtotal}>
                ${subtotal.toFixed(2)}
              </Text>
            )}
            <Text style={styles.lineTotal}>${lineTotal.toFixed(2)}</Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <TouchableOpacity
            onPress={handleRemovePress}
            style={[
              styles.removeBtn,
              confirmRemove && styles.removeBtnConfirm,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.removeBtnText,
                confirmRemove && styles.removeBtnTextConfirm,
              ]}
            >
              {confirmRemove ? '!' : '✕'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {confirmRemove && (
        <Text style={styles.confirmHint}>{t('transaction.tap_again_to_remove')}</Text>
      )}

      <View style={styles.discountRow}>
        <DiscountField
          discountType={item.discountType}
          discountValue={
            item.discountValueInput ??
            (item.discountValue != null ? String(item.discountValue) : '')
          }
          onChange={onDiscountChange}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.l,
    ...theme.shadows.sm,
    gap: theme.spacing.s,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.m,
    marginRight: theme.spacing.s,
  },
  thumbPlaceholder: {
    backgroundColor: theme.colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  info: { flex: 1, marginRight: theme.spacing.xs },
  name: { fontWeight: '700', fontSize: 15, color: theme.colors.text },
  price: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  controlsWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: theme.spacing.s,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.radius.round,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.round,
    ...theme.shadows.sm,
  },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  qtyText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    minWidth: 28,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  originalSubtotal: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  lineTotal: {
    fontWeight: '800',
    fontSize: 14,
    color: theme.colors.primary,
  },
  removeBtn: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.dangerLight,
    borderRadius: theme.radius.round,
    minWidth: 36,
    alignItems: 'center',
  },
  removeBtnConfirm: {
    backgroundColor: theme.colors.danger,
  },
  removeBtnText: { color: theme.colors.danger, fontSize: 16, fontWeight: '900' },
  removeBtnTextConfirm: { color: '#FFF' },
  confirmHint: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.danger,
    textAlign: 'right',
    marginTop: -4,
  },
  discountRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.s,
  },
});
