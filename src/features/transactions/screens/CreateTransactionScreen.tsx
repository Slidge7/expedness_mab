import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  transactionService,
  TransactionItemDTO,
} from '../api/transactionService';
import { fetchMissions } from '../../../store/missionSlice';
import { fetchLocations } from '../../../store/locationSlice';
import { fetchItems } from '../../../store/itemSlice'; // Load inventory
import { theme } from '../../../theme';
import { AddItemModal } from '../components/AddItemModal'; // Import the component we just made

export const CreateTransactionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Global Data
  const missions = useAppSelector(state => state.missions.items);
  const locations = useAppSelector(state => state.locations.items);
  const user = useAppSelector(state => state.auth.user);

  // Form State
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [missionId, setMissionId] = useState<number | undefined>(undefined);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);

  // The Cart (List of Items)
  const [cartItems, setCartItems] = useState<TransactionItemDTO[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMissions());
    dispatch(fetchLocations());
    dispatch(fetchItems()); // Need items for the picker inside modal
  }, [dispatch]);

  // Add item from Modal to Cart
  const handleAddItem = (item: TransactionItemDTO) => {
    setCartItems([...cartItems, item]);
  };

  // Remove item from Cart
  const handleRemoveItem = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  // Calculate Estimated Total (for display only)
  const estimatedTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the transaction.');
      return;
    }
    if (!description) {
      Alert.alert('Error', 'Please provide a description.');
      return;
    }

    try {
      await transactionService.create({
        description,
        type,
        missionId,
        locationId,
        userId: user?.id,
        transactionDate: new Date().toISOString(),
        items: cartItems, // <--- Sending the array
        // totalAmount is calculated by backend
      });

      Alert.alert('Success', 'Transaction Created');
      navigation.goBack();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Failed to save transaction.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HEADER SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.row}>
            {['EXPENSE', 'INCOME'].map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t as any)}
                style={[styles.typeBtn, type === t && styles.activeTypeBtn]}
              >
                <Text style={{ color: type === t ? '#fff' : '#000' }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="General Description"
          />

          <Text style={styles.label}>Mission (Optional)</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={missionId} onValueChange={setMissionId}>
              <Picker.Item label="-- None --" value={undefined} />
              {missions.map(m => (
                <Picker.Item key={m.id} label={m.title} value={m.id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Location (Optional)</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={locationId} onValueChange={setLocationId}>
              <Picker.Item label="-- None --" value={undefined} />
              {locations.map(l => (
                <Picker.Item key={l.id} label={l.name} value={l.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* ITEMS SECTION */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={styles.sectionTitle}>Items ({cartItems.length})</Text>
            <TouchableOpacity onPress={() => setIsModalOpen(true)}>
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                + Add Item
              </Text>
            </TouchableOpacity>
          </View>

          {cartItems.length === 0 ? (
            <Text style={styles.emptyText}>No items added yet.</Text>
          ) : (
            cartItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.itemReason}>
                    {item.reason || 'No specific reason'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemMath}>
                    {item.quantity} x ${item.unitPrice}
                  </Text>
                  <Text style={styles.itemTotal}>
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(index)}
                  style={{ marginLeft: 10 }}
                >
                  <Text style={{ color: 'red', fontSize: 20 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* TOTAL FOOTER */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Total:</Text>
            <Text style={styles.totalValue}>${estimatedTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* SUBMIT BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* POPUP MODAL */}
      <AddItemModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddItem}
        transactionType={type}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 10,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 10,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    fontSize: 16,
    color: '#334155',
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 5 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTypeBtn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 5,
  },

  // Item Row Styles
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemCategory: { fontWeight: '700', fontSize: 15, color: '#334155' },
  itemReason: { color: '#94A3B8', fontSize: 13 },
  itemMath: { fontSize: 12, color: '#64748B' },
  itemTotal: { fontWeight: '700', color: '#1E293B' },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#F1F5F9',
    paddingTop: 15,
  },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '800', color: theme.colors.primary },

  // Footer Button
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
