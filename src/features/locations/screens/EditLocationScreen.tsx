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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch } from '../../../store/hooks';
import { fetchClients } from '../../../store/clientSlice';
import { fetchProviders } from '../../../store/providerSlice';
import { locationService } from '../api/locationService';
import { OptionalClientPicker } from '../../transactions/components/OptionalClientPicker';
import { OptionalProviderPicker } from '../../transactions/components/OptionalProviderPicker';
import { theme } from '../../../theme';

export const EditLocationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const locationId = route.params?.locationId as number;
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    clientId: null as number | null,
    providerId: null as number | null,
  });

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchProviders());
    locationService
      .getById(locationId)
      .then(loc => {
        setForm({
          name: loc.name,
          city: loc.city,
          address: loc.address,
          latitude: loc.latitude?.toString() || '',
          longitude: loc.longitude?.toString() || '',
          clientId: loc.clientId ?? null,
          providerId: loc.providerId ?? null,
        });
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to load location.');
        navigation.goBack();
      })
      .finally(() => setFetching(false));
  }, [locationId, dispatch, navigation]);

  const handleSave = async () => {
    if (!form.name || !form.city || !form.address) {
      Alert.alert('Error', 'Name, city, and address are required');
      return;
    }

    setLoading(true);
    try {
      await locationService.update(locationId, {
        name: form.name,
        city: form.city,
        address: form.address,
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
        clientId: form.clientId,
        providerId: form.providerId,
      });
      Alert.alert('Success', 'Location updated.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Save Failed', error.message || 'Check your backend connection');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>Location Name *</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={t => setForm({ ...form, name: t })}
      />

      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        value={form.city}
        onChangeText={t => setForm({ ...form, city: t })}
      />

      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={styles.input}
        value={form.address}
        onChangeText={t => setForm({ ...form, address: t })}
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
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={form.longitude}
            onChangeText={t => setForm({ ...form, longitude: t })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Client (Optional)</Text>
      <OptionalClientPicker
        value={form.clientId}
        onChange={clientId => setForm({ ...form, clientId })}
      />

      <Text style={styles.label}>Provider (Optional)</Text>
      <OptionalProviderPicker
        value={form.providerId}
        onChange={providerId => setForm({ ...form, providerId })}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Changes</Text>
        )}
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
  row: { flexDirection: 'row' },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
