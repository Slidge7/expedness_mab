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
  // Get existing Inventory from Redux
  const inventoryItems = useAppSelector(state => state.items.items);

  // Local Form State
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(
    undefined,
  );
  const [category, setCategory] = useState(''); // e.g., FUEL, SUPPLIES
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedItemId(undefined);
      setCategory('');
      setReason('');
      setQuantity('1');
      setUnitPrice('');
    }
  }, [visible]);

  // When user picks an item from inventory, auto-fill fields
  const handleItemPick = (id: number) => {
    setSelectedItemId(id);
    const item = inventoryItems.find(i => i.id === id);
    if (item) {
      setUnitPrice(item.unitPrice.toString());
      setCategory(item.category || '');
      // If it's a known item, we might not need a "reason" every time, but good to keep open
    }
  };

  const handleSave = () => {
    if (!quantity || !unitPrice || !category) {
      alert('Please fill Quantity, Price, and Category');
      return;
    }

    const newItem: TransactionItemDTO = {
      itemId: selectedItemId, // If undefined, backend creates new item
      // We don't send 'itemName' in request based on your JSON example, backend infers it or uses generic logic?
      // *Correction*: Your backend 'createNewItem(itemDTO)' probably needs a name if itemId is null.
      // Let's assume 'category' maps to name or you add a Name field if you want custom names.
      // For now, mapping Category as the main identifier if custom.
      category: category,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      reason: reason,
      type: transactionType,
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Add Line Item</Text>

          {/* 1. Pick Existing Item */}
          <Text style={styles.label}>Select Item (Optional)</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedItemId}
              onValueChange={handleItemPick}
            >
              <Picker.Item label="-- Create Custom Item --" value={undefined} />
              {inventoryItems
                .filter(i => i.active) // Only show active items
                .map(i => (
                  <Picker.Item key={i.id} label={i.name} value={i.id} />
                ))}
            </Picker>
          </View>

          {/* 2. Manual Fields */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Unit Price</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={unitPrice}
                onChangeText={setUnitPrice}
              />
            </View>
          </View>

          <Text style={styles.label}>Category / Item Name</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. FUEL, OFFICE SUPPLIES"
          />

          <Text style={styles.label}>Reason / Description</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. For vehicle repair"
          />

          <View style={styles.btnRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={{ color: '#fff' }}>Add to List</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.colors.primary,
  },
  label: { fontSize: 12, color: '#64748B', marginTop: 10, fontWeight: '700' },
  input: {
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    fontSize: 16,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginTop: 5,
  },
  row: { flexDirection: 'row' },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 25,
    gap: 10,
  },
  cancelBtn: { padding: 10 },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
