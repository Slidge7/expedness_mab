// src/features/transactions/components/AddItemModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAppSelector } from '../../../store/hooks';
import { TransactionItemDTO } from '../api/transactionService';
import { theme } from '../../../theme';
import { QuantityPicker } from './QuantityPicker';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: TransactionItemDTO) => void;
  transactionType: 'INCOME' | 'EXPENSE';
}

export const AddItemModal = ({
  visible,
  onClose,
  onAdd,
  transactionType,
}: Props) => {
  const inventoryItems = useAppSelector(state => state.items.items);

  // Form state — all pre-filled from selected item, user can override
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(
    undefined,
  );
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');

  // Reset form on open
  useEffect(() => {
    if (visible) {
      setSelectedItemId(undefined);
      setCategory('');
      setReason('');
      setQuantity(1);
      setUnitPrice('');
    }
  }, [visible]);

  // When user selects an item → auto-fill ALL fields from item data
  // NOTE: On web, @react-native-picker/picker fires onValueChange with a string,
  // even if the value prop was a number. We normalize here to avoid find() mismatches.
  const handleItemSelect = (rawId: number | string | undefined) => {
    const isCustom =
      rawId === undefined || rawId === 'undefined' || rawId === '';
    const id = isCustom ? undefined : Number(rawId);

    setSelectedItemId(id);
    if (id === undefined) {
      // "Custom item" selected — clear fields
      setCategory('');
      setReason('');
      setUnitPrice('');
      setQuantity(1);
      return;
    }

    const item = inventoryItems.find(i => i.id === id);
    if (item) {
      setCategory(item.category || item.name || '');
      setUnitPrice(item.unitPrice?.toString() || '');
      setReason(item.description || item.reason || '');
      // quantity stays at 1 by default — user adjusts via scroll picker
    }
  };

  const handleSave = () => {
    if (!unitPrice || !category) {
      alert('Please fill in Category and Unit Price.');
      return;
    }

    const newItem: TransactionItemDTO = {
      itemId: selectedItemId,
      category,
      quantity,
      unitPrice: parseFloat(unitPrice),
      reason,
      type: transactionType,
    };

    onAdd(newItem);
    onClose();
  };

  const lineTotal = quantity * (parseFloat(unitPrice) || 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Item</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* ── Step 1: Select Item ── */}
            <Text style={styles.sectionLabel}>SELECT ITEM</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={selectedItemId}
                onValueChange={handleItemSelect}
                style={styles.picker}
              >
                <Picker.Item label="+ Custom Item" value={undefined} />
                {inventoryItems
                  .filter(i => i.active)
                  .map(i => (
                    <Picker.Item key={i.id} label={i.name} value={i.id} />
                  ))}
              </Picker>
            </View>

            {/* ── Step 2: Quantity (drum roll) + Price (editable) ── */}
            <View style={styles.quantityPriceRow}>
              {/* Quantity drum picker */}
              <View style={styles.quantityBlock}>
                <Text style={styles.fieldLabel}>QUANTITY</Text>
                <View style={styles.drumWrapper}>
                  <QuantityPicker
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={999}
                  />
                </View>
              </View>

              {/* Vertical divider */}
              <View style={styles.divider} />

              {/* Price + subtotal */}
              <View style={styles.priceBlock}>
                <Text style={styles.fieldLabel}>UNIT PRICE</Text>
                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                  placeholder="0.00"
                  placeholderTextColor="#CBD5E1"
                />
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>
                    ${lineTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Step 3: Editable details (pre-filled from item) ── */}
            <Text style={styles.sectionLabel}>DETAILS</Text>

            <Text style={styles.fieldLabel}>CATEGORY / ITEM NAME</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. FUEL, OFFICE SUPPLIES"
              placeholderTextColor="#CBD5E1"
            />

            <Text style={styles.fieldLabel}>REASON / NOTES</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={reason}
              onChangeText={setReason}
              placeholder="Optional description"
              placeholderTextColor="#CBD5E1"
              multiline
              numberOfLines={2}
            />
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveText}>Add to List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end', // Slide up from bottom
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: { fontSize: 14, color: '#64748B', fontWeight: '700' },

  // Section labels
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
  },

  // Item picker
  pickerBox: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  picker: { color: '#1E293B' },

  // Quantity + Price row
  quantityPriceRow: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    alignItems: 'center',
  },
  quantityBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  drumWrapper: {
    marginTop: 8,
    alignItems: 'center',
  },
  divider: {
    width: 1.5,
    alignSelf: 'stretch',
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  priceBlock: {
    flex: 1.4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  priceInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
    paddingBottom: 4,
    marginTop: 4,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  subtotalLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },

  // Text inputs
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#334155',
    backgroundColor: '#F8FAFC',
  },
  multilineInput: {
    height: 64,
    textAlignVertical: 'top',
    paddingTop: 10,
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
