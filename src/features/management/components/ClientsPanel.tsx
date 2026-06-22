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
import { clientService, ClientDTO } from '../../clients/api/clientService';
import { theme } from '../../../theme';
import { managementStyles as s } from '../styles/managementStyles';
import { useTranslation } from 'react-i18next';

interface Props {
  isActive: boolean;
}

export const ClientsPanel: React.FC<Props> = ({ isActive }) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [items, setItems] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await clientService.getAll());
    } catch {
      Alert.alert(t('common.error'), 'Failed to load clients.');
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
            onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
          >
            <View style={s.cardHeader}>
              <Text style={s.title}>{item.name}</Text>
              {item.city ? <Text style={s.badge}>{item.city}</Text> : null}
            </View>
            {item.company ? <Text style={s.subtitle}>{item.company}</Text> : null}
            {item.address ? <Text style={s.meta}>{item.address}</Text> : null}
            <Text style={[s.meta, { marginTop: 6 }]}>{t('management.tap_to_manage_contacts')}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={s.emptyText}>{t('management.no_clients')}</Text>
        }
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateClient')}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};
