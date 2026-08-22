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
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

export const EditLocationScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { t } = useTranslation();
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
        Alert.alert(t('common.error'), t('locations.load_failed'));
        navigation.goBack();
      })
      .finally(() => setFetching(false));
  }, [locationId, dispatch, navigation, t]);

  const handleSave = async () => {
    if (!form.name || !form.city || !form.address) {
      Alert.alert(t('common.error'), t('locations.required_fields'));
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
      Alert.alert(t('common.success'), t('locations.updated'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        t('locations.save_failed'),
        error.message || t('locations.check_backend'),
      );
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
      <Text style={styles.label}>{t('locations.location_name')}</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={text => setForm({ ...form, name: text })}
      />

      <Text style={styles.label}>{t('locations.city_required')}</Text>
      <TextInput
        style={styles.input}
        value={form.city}
        onChangeText={text => setForm({ ...form, city: text })}
      />

      <Text style={styles.label}>{t('locations.address_required')}</Text>
      <TextInput
        style={styles.input}
        value={form.address}
        onChangeText={text => setForm({ ...form, address: text })}
        multiline
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>{t('locations.latitude')}</Text>
          <TextInput
            style={styles.input}
            value={form.latitude}
            onChangeText={text => setForm({ ...form, latitude: text })}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t('locations.longitude')}</Text>
          <TextInput
            style={styles.input}
            value={form.longitude}
            onChangeText={text => setForm({ ...form, longitude: text })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>{t('locations.client_optional')}</Text>
      <OptionalClientPicker
        value={form.clientId}
        onChange={clientId => setForm({ ...form, clientId })}
      />

      <Text style={styles.label}>{t('locations.provider_optional')}</Text>
      <OptionalProviderPicker
        value={form.providerId}
        onChange={providerId => setForm({ ...form, providerId })}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>{t('transaction.save_changes')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
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
