import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TransactionItemDTO } from '../api/transactionService';
import { theme } from '../../../theme';

interface Props {
  item: TransactionItemDTO;
  displayName: string;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
}

export const SelectedCartItemRow: React.FC<Props> = ({
  item,
  displayName,
  onDecrement,
  onIncrement,
  onRemove,
}) => (
  <View style={styles.card}>
    <View style={styles.info}>
      <Text style={styles.name}>{displayName}</Text>
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
      <Text style={styles.lineTotal}>
        ${(item.quantity * item.unitPrice).toFixed(2)}
      </Text>
    </View>

    <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
      <Text style={styles.removeBtnText}>✕</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.l,
    ...theme.shadows.sm,
  },
  info: { flex: 1 },
  name: { fontWeight: '700', fontSize: 16, color: theme.colors.text },
  price: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  controlsWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.round,
    ...theme.shadows.sm,
  },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  qtyText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    minWidth: 32,
    textAlign: 'center',
  },
  lineTotal: {
    fontWeight: '800',
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: 8,
  },
  removeBtn: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.dangerLight,
    borderRadius: theme.radius.round,
  },
  removeBtnText: { color: theme.colors.danger, fontSize: 16, fontWeight: '900' },
});
