import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { transactionService } from '../api/transactionService';
import { fetchMissions } from '../../../store/missionSlice';
import { fetchLocations } from '../../../store/locationSlice'; // IMPORT THIS
import { theme } from '../../../theme';

export const CreateTransactionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Select data from all three slices
  const { items: missions } = useAppSelector(state => state.missions);
  const { items: locations } = useAppSelector(state => state.locations);
  const { user } = useAppSelector(state => state.auth);

  const [form, setForm] = useState({
    amount: '',
    description: '',
    type: 'EXPENSE',
    missionId: undefined as number | undefined,
    locationId: undefined as number | undefined,
  });

  useEffect(() => {
    // Load dependencies when form opens
    dispatch(fetchMissions());
    dispatch(fetchLocations());
  }, [dispatch]);

  const handleSave = async () => {
    if (!form.amount || !form.description) {
      Alert.alert('Error', 'Amount and Description are required');
      return;
    }

    try {
      await transactionService.create({
        amount: parseFloat(form.amount),
        description: form.description,
        type: form.type as any,
        missionId: form.missionId,
        locationId: form.locationId,
        userId: user?.id, // Link to current user
        transactionDate: new Date().toISOString(),
      });

      Alert.alert('Success', 'Transaction Registered');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not save transaction to backend');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>New Transaction</Text>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="0.00"
        onChangeText={v => setForm({ ...form, amount: v })}
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {['EXPENSE', 'INCOME'].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setForm({ ...form, type: t })}
            style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
          >
            <Text
              style={[styles.typeBtnText, form.type === t && { color: '#FFF' }]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Link to Mission</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.missionId}
          onValueChange={itemValue =>
            setForm({ ...form, missionId: itemValue })
          }
        >
          <Picker.Item
            label="-- Select Mission (Optional) --"
            value={undefined}
          />
          {missions.map(m => (
            <Picker.Item key={m.id} label={m.title} value={m.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Link to Location</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.locationId}
          onValueChange={itemValue =>
            setForm({ ...form, locationId: itemValue })
          }
        >
          <Picker.Item
            label="-- Select Location (Optional) --"
            value={undefined}
          />
          {locations.map(l => (
            <Picker.Item
              key={l.id}
              label={`${l.name} (${l.city})`}
              value={l.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        placeholder="What was this for?"
        onChangeText={v => setForm({ ...form, description: v })}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 20,
  },
  label: {
    marginTop: 15,
    fontWeight: '700',
    color: '#475569',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 16,
    color: '#1E293B',
  },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeBtnText: { fontWeight: '600', color: '#64748B' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#F8FAFC',
  },
  saveBtn: {
    marginTop: 40,
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
  },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
