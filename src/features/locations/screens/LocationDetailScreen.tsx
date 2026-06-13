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
  const locationId = route.params?.locationId as number;
  const [location, setLocation] = useState<LocationDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    locationService
      .getById(locationId)
      .then(setLocation)
      .catch(() => {
        Alert.alert('Error', 'Failed to load location.');
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [locationId, navigation]);

  const handleDelete = () => {
    Alert.alert('Delete Location', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await locationService.delete(locationId);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete location.');
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
          label="Coordinates"
          value={
            location?.latitude != null && location?.longitude != null
              ? `${location.latitude}, ${location.longitude}`
              : null
          }
        />
        <InfoRow label="Client" value={location?.clientName} />
        <InfoRow label="Provider" value={location?.providerName} />
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditLocation', { locationId })}
      >
        <Text style={styles.editText}>Edit Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Location</Text>
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
