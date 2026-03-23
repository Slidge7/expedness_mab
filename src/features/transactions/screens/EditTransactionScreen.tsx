import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  transactionService,
  TransactionItemDTO,
} from '../api/transactionService';
import { fetchMissions } from '../../../store/missionSlice';
import { fetchLocations } from '../../../store/locationSlice';
import { fetchItems } from '../../../store/itemSlice';
import { theme } from '../../../theme';
import { AddItemModal } from '../components/AddItemModal';
import { CategoryPicker } from '../components/CategoryPicker';

type RouteParams = { transactionId: number };

export const EditTransactionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { transactionId } = route.params;
  const dispatch = useAppDispatch();

  const missions = useAppSelector(state => state.missions.items);
  const locations = useAppSelector(state => state.locations.items);
  const user = useAppSelector(state => state.auth.user);

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [description, setDescription] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [fuelTank, setFuelTank] = useState<'ft1' | 'ft2' | 'ft3'>('ft1');
  const [category, setCategory] = useState('');
  const [missionId, setMissionId] = useState<number | undefined>(undefined);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [snapBalance, setSnapBalance] = useState<
    'AFTER' | 'BEFORE' | undefined
  >(undefined);
  const [cartItems, setCartItems] = useState<TransactionItemDTO[]>([]);

  useEffect(() => {
    dispatch(fetchMissions());
    dispatch(fetchLocations());
    dispatch(fetchItems());
    loadTransaction();
  }, []);

  const loadTransaction = async () => {
    try {
      setFetching(true);
      const tx = await transactionService.getById(transactionId);
      setDescription(tx.description);
      setType(tx.type);
      setFuelTank((tx.fuelTank as any) || 'ft1');
      setCategory(tx.category || '');
      setMissionId(tx.missionId);
      setLocationId(tx.locationId);
      setCartItems(tx.items || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load transaction.');
      navigation.goBack();
    } finally {
      setFetching(false);
    }
  };

  const handleAddItems = (items: TransactionItemDTO[]) => {
    setCartItems(prev => [...prev, ...items]);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const estimatedTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description.');
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item.');
      return;
    }
    try {
      setSaving(true);
      await transactionService.update(transactionId, {
        description,
        type,
        fuelTank,
        category: category || undefined,
        missionId,
        locationId,
        userId: user?.id,
        snapBalance,
        transactionDate: new Date().toISOString(),
        items: cartItems,
      });
      Alert.alert('Success', 'Transaction updated.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update transaction.');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Details</Text>

          <Text style={styles.label}>Type</Text>
          <View style={styles.row}>
            {(['EXPENSE', 'INCOME'] as const).map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[styles.typeBtn, type === t && styles.typeBtnActive]}
              >
                <Text
                  style={{
                    color: type === t ? '#fff' : '#64748B',
                    fontWeight: '700',
                  }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Payment Mode (Fuel Tank)</Text>
          <View style={styles.row}>
            {(['ft1', 'ft2', 'ft3'] as const).map(ft => (
              <TouchableOpacity
                key={ft}
                onPress={() => setFuelTank(ft)}
                style={[styles.ftBtn, fuelTank === ft && styles.ftBtnActive]}
              >
                <Text
                  style={{
                    color: fuelTank === ft ? '#fff' : '#64748B',
                    fontWeight: '600',
                  }}
                >
                  {ft.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Category</Text>
          <CategoryPicker value={category} onChange={setCategory} />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="General description"
            placeholderTextColor="#94A3B8"
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items ({cartItems.length})</Text>
            <TouchableOpacity onPress={() => setIsModalOpen(true)}>
              <Text style={styles.addLink}>+ Add Items</Text>
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
                    {item.reason || 'No reason'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemMath}>
                    {item.quantity} × {item.unitPrice}
                  </Text>
                  <Text style={styles.itemTotal}>
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(index)}
                  style={{ marginLeft: 10 }}
                >
                  <Text style={{ color: '#EF4444', fontSize: 20 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalValue}>{estimatedTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance Snapshot</Text>
          <Text style={styles.snapHint}>
            Optionally capture a balance snapshot relative to this update.
          </Text>
          <View style={styles.row}>
            {([undefined, 'BEFORE', 'AFTER'] as const).map(opt => (
              <TouchableOpacity
                key={String(opt)}
                onPress={() => setSnapBalance(opt)}
                style={[
                  styles.snapBtn,
                  snapBalance === opt && styles.snapBtnActive,
                ]}
              >
                <Text
                  style={{
                    color: snapBalance === opt ? '#fff' : '#64748B',
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {opt === undefined ? 'None' : opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, saving && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitText}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      <AddItemModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMultiple={handleAddItems}
        transactionType={type}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 10,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 14,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    fontSize: 15,
    color: '#334155',
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  typeBtn: {
    flex: 1,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  ftBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  ftBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 5,
  },
  addLink: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemCategory: { fontWeight: '700', fontSize: 14, color: '#334155' },
  itemReason: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  itemMath: { fontSize: 12, color: '#64748B' },
  itemTotal: { fontWeight: '700', color: '#1E293B', fontSize: 15 },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#F1F5F9',
    paddingTop: 15,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  totalValue: { fontSize: 20, fontWeight: '800', color: theme.colors.primary },
  snapHint: { fontSize: 12, color: '#94A3B8', marginBottom: 10 },
  snapBtn: {
    flex: 1,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  snapBtnActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
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
