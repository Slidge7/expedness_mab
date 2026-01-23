import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../../store/hooks';
import { createItem } from '../../../store/itemSlice';
import { theme } from '../../../theme';

export const CreateItemScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    unitPrice: '',
    category: '',
    type: 'EXPENSE', // Default
    unit: 'pcs',
    active: true,
  });

  const handleSave = async () => {
    if (!form.name || !form.unitPrice) {
      Alert.alert('Error', 'Name and Price are required');
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        createItem({
          ...form,
          unitPrice: parseFloat(form.unitPrice),
          type: form.type as 'INCOME' | 'EXPENSE',
        }),
      ).unwrap(); // .unwrap() lets us catch errors from the Thunk

      Alert.alert('Success', 'Item created!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Item Name *</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={t => setForm({ ...form, name: t })}
      />

      <Text style={styles.label}>Unit Price *</Text>
      <TextInput
        style={styles.input}
        value={form.unitPrice}
        onChangeText={t => setForm({ ...form, unitPrice: t })}
        keyboardType="numeric"
        placeholder="0.00"
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.row}>
        {['EXPENSE', 'INCOME'].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setForm({ ...form, type: t })}
            style={[
              styles.typeBtn,
              form.type === t && { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={{ color: form.type === t ? '#FFF' : '#64748B' }}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={form.category}
        onChangeText={t => setForm({ ...form, category: t })}
        placeholder="e.g. Electronics, Service"
      />

      <Text style={styles.label}>Unit</Text>
      <TextInput
        style={styles.input}
        value={form.unit}
        onChangeText={t => setForm({ ...form, unit: t })}
        placeholder="e.g. kg, hr, box"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Active Status</Text>
        <Switch
          value={form.active}
          onValueChange={v => setForm({ ...form, active: v })}
        />
      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? 'Saving...' : 'Create Item'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  label: { marginTop: 15, fontWeight: '700', color: '#475569', fontSize: 13 },
  input: {
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtn: {
    marginTop: 40,
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
