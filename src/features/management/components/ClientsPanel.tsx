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
import { useTheme } from '../../../theme/ThemeContext';
import { createManagementStyles } from '../styles/managementStyles';
import { useTranslation } from 'react-i18next';

interface Props {
  isActive: boolean;
}

export const ClientsPanel: React.FC<Props> = ({ isActive }) => {
  const theme = useTheme();
  const s = createManagementStyles(theme);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [items, setItems] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await clientService.getAll());
    } catch {
      Alert.alert(t('common.error'), t('management.load_clients_error'));
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

  const renderItem = useCallback(
    ({ item }: { item: ClientDTO }) => (
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
    ),
    [navigation, t],
  );

  return (
    <View style={s.panel}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id?.toString() ?? `fallback-${index}`}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderItem={renderItem}
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
