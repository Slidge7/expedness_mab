import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { locationService, LocationDTO } from '../api/locationService';
import { theme } from '../../../theme';
import { useTranslation } from 'react-i18next';

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

export const LocationDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const locationId = route.params?.locationId as number;
  const [location, setLocation] = useState<LocationDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    locationService
      .getById(locationId)
      .then(setLocation)
      .catch(() => {
        Alert.alert(t('common.error'), t('locations.load_failed'));
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [locationId, navigation, t]);

  const handleDelete = () => {
    Alert.alert(t('locations.delete_title'), t('locations.delete_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await locationService.delete(locationId);
            navigation.goBack();
          } catch {
            Alert.alert(t('common.error'), t('locations.delete_failed'));
          }
        },
      },
    ]);
  };

  if (loading) {
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
      <Text style={styles.title}>{location?.name}</Text>
      <Text style={styles.subtitle}>
        {[location?.city, location?.address].filter(Boolean).join(' · ')}
      </Text>

      <View style={styles.section}>
        <InfoRow
          label={t('locations.coordinates')}
          value={
            location?.latitude != null && location?.longitude != null
              ? `${location.latitude}, ${location.longitude}`
              : null
          }
        />
        <InfoRow label={t('transaction.client')} value={location?.clientName} />
        <InfoRow label={t('transaction.provider')} value={location?.providerName} />
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditLocation', { locationId })}
      >
        <Text style={styles.editText}>{t('nav.edit_location')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>{t('locations.delete_title')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  title: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 6 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 13, color: '#94A3B8', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#1E293B', fontWeight: '500' },
  editBtn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  editText: { color: '#fff', fontWeight: '700' },
  deleteBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  deleteText: { color: '#DC2626', fontWeight: '600' },
});
