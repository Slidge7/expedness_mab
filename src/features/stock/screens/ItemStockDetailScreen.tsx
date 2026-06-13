import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch } from '../../../store/hooks';
import {
  adjustStock,
  disableStock,
} from '../../../store/stockSlice';
import { fetchItemById } from '../../../store/itemSlice';
import { stockService } from '../api/stockService';
import { ItemDTO } from '../../items/api/itemService';
import { theme } from '../../../theme';

type AdjustMode = 'ADD' | 'REMOVE' | 'SET' | null;

export const ItemStockDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const itemId = route.params?.itemId as number;

  const [item, setItem] = useState<ItemDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustMode, setAdjustMode] = useState<AdjustMode>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stockService.getByItem(itemId);
      setItem(data);
    } catch {
      Alert.alert('Error', 'Failed to load stock info.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [itemId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdjust = async () => {
    if (!adjustMode) return;
    const qty = parseFloat(adjustQty);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Error', 'Enter a valid quantity.');
      return;
    }
    if (adjustMode !== 'SET' && qty <= 0) {
      Alert.alert('Error', 'Quantity must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await dispatch(
        adjustStock({ itemId, quantity: qty, operation: adjustMode }),
      ).unwrap();
      setItem(updated);
      await dispatch(fetchItemById(itemId));
      setAdjustMode(null);
      setAdjustQty('');
    } catch {
      Alert.alert('Error', 'Failed to adjust stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = () => {
    Alert.alert(
      'Disable Stock Tracking',
      'Stock will be reset to zero for this item.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            setDisabling(true);
            try {
              await dispatch(disableStock(itemId)).unwrap();
              await dispatch(fetchItemById(itemId));
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to disable stock tracking.');
            } finally {
              setDisabling(false);
            }
          },
        },
      ],
    );
  };

  if (loading || !item) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const low =
    item.minStock != null &&
    item.currentStock != null &&
    item.currentStock <= item.minStock;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.unit && <Text style={styles.unit}>Unit: {item.unit}</Text>}

        <View style={[styles.qtyCard, low && styles.qtyCardLow]}>
          <Text style={styles.qtyLabel}>Current Stock</Text>
          <Text style={[styles.qtyValue, low && styles.qtyValueLow]}>
            {item.currentStock ?? 0}
          </Text>
          {item.minStock != null && (
            <Text style={styles.minLabel}>Minimum: {item.minStock}</Text>
          )}
          {low && <Text style={styles.lowWarning}>Stock is below minimum</Text>}
        </View>

        {adjustMode ? (
          <View style={styles.adjustPanel}>
            <Text style={styles.adjustTitle}>
              {adjustMode === 'ADD'
                ? 'Add Stock'
                : adjustMode === 'REMOVE'
                  ? 'Remove Stock'
                  : 'Set Stock'}
            </Text>
            <TextInput
              style={styles.input}
              value={adjustQty}
              onChangeText={setAdjustQty}
              keyboardType="decimal-pad"
              placeholder="Quantity"
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.adjustActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setAdjustMode(null);
                  setAdjustQty('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleAdjust}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setAdjustMode('ADD')}
            >
              <Text style={styles.actionBtnText}>+ Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setAdjustMode('REMOVE')}
            >
              <Text style={styles.actionBtnText}>− Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setAdjustMode('SET')}
            >
              <Text style={styles.actionBtnText}>Set</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.itemLink}
          onPress={() => navigation.navigate('ItemDetail', { itemId })}
        >
          <Text style={styles.itemLinkText}>View Item Details →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.disableBtn}
          onPress={handleDisable}
          disabled={disabling}
        >
          {disabling ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Text style={styles.disableBtnText}>Disable Stock Tracking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  itemName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  unit: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  qtyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyCardLow: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  qtyLabel: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  qtyValue: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  qtyValueLow: { color: '#DC2626' },
  minLabel: { fontSize: 13, color: '#94A3B8', marginTop: 8 },
  lowWarning: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 8,
  },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  adjustPanel: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adjustTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 12,
  },
  adjustActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#64748B', fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#FFF', fontWeight: '700' },
  itemLink: { alignItems: 'center', marginBottom: 24 },
  itemLinkText: { color: theme.colors.primary, fontSize: 15, fontWeight: '600' },
  disableBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  disableBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
