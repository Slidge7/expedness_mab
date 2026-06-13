import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { locationService, LocationDTO } from '../../locations/api/locationService';
import { theme } from '../../../theme';
import { managementStyles as s } from '../styles/managementStyles';

interface Props {
  isActive: boolean;
}

export const LocationsPanel: React.FC<Props> = ({ isActive }) => {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<LocationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await locationService.getAll());
    } catch {
      Alert.alert('Error', 'Failed to load locations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isActive) load();
  }, [isActive, load]);

  if (loading && isActive) {
    return (
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={s.panel}>
      <FlatList
        data={items}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() =>
              navigation.navigate('LocationDetail', { locationId: item.id })
            }
          >
            <View style={s.cardHeader}>
              <Text style={s.title}>{item.name}</Text>
              {item.city ? <Text style={s.badge}>{item.city}</Text> : null}
            </View>
            {item.address ? <Text style={s.subtitle}>{item.address}</Text> : null}
            {(item.clientName || item.providerName) && (
              <Text style={s.meta}>
                {[item.clientName, item.providerName].filter(Boolean).join(' · ')}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={s.emptyText}>No locations yet. Add your first one.</Text>
        }
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateLocation')}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};
