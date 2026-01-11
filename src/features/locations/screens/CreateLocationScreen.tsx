import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { locationService } from '../api/locationService';
import { theme } from '../../../theme';

export const CreateLocationScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const handleSave = async () => {
    // Validation
    if (!form.name || !form.city || !form.address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await locationService.create({
        name: form.name,
        city: form.city,
        address: form.address,
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
      });

      Alert.alert('Success', 'Location created successfully!');
      navigation.goBack(); // Return to list
    } catch (error: any) {
      Alert.alert(
        'Save Failed',
        error.message || 'Check your backend connection',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.label}>Location Name *</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={t => setForm({ ...form, name: t })}
        placeholder="e.g. Main Warehouse"
      />

      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        value={form.city}
        onChangeText={t => setForm({ ...form, city: t })}
        placeholder="e.g. Casablanca"
      />

      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={styles.input}
        value={form.address}
        onChangeText={t => setForm({ ...form, address: t })}
        placeholder="Full street address"
        multiline
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.input}
            value={form.latitude}
            onChangeText={t => setForm({ ...form, latitude: t })}
            keyboardType="numeric"
            placeholder="33.57"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={form.longitude}
            onChangeText={t => setForm({ ...form, longitude: t })}
            keyboardType="numeric"
            placeholder="-7.58"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Location</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: { padding: 16, alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: '600' },
});
