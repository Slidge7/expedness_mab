import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { locationService, LocationDTO } from '../api/locationService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export const LocationListScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocations = async () => {
    try {
      const data = await locationService.getAll();
      setLocations(data);
    } catch (error: any) {
      console.error(error);
      Alert.alert(t('common.error'), t('locations.fetch_failed'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLocations();
  }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchLocations();
    }
  }, [isFocused]);

  const renderItem = ({ item }: { item: LocationDTO }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.cityBadge}>{item.city}</Text>
      </View>
      <Text style={styles.address}>{item.address}</Text>
      <View style={styles.coords}>
        <Text style={styles.coordText}>
          {t('locations.coords_format', {
            lat: item.latitude,
            lng: item.longitude,
          })}
        </Text>
      </View>
    </View>
  );

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
    <View style={styles.container}>
      <FlatList
        data={locations}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('locations.no_locations')}</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLocation')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  cityBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    color: '#475569',
    overflow: 'hidden',
  },
  address: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  coords: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  coordText: { fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94A3B8' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: '300' },
});
