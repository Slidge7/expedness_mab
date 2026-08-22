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
import { providerService, ProviderDTO } from '../../providers/api/providerService';
import { useTheme } from '../../../theme/ThemeContext';
import { createManagementStyles } from '../styles/managementStyles';
import { useTranslation } from 'react-i18next';

interface Props {
  isActive: boolean;
}

export const ProvidersPanel: React.FC<Props> = ({ isActive }) => {
  const theme = useTheme();
  const s = createManagementStyles(theme);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [items, setItems] = useState<ProviderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await providerService.getAll());
    } catch {
      Alert.alert(t('common.error'), t('management.load_providers_error'));
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
              navigation.navigate('ProviderDetail', { providerId: item.id })
            }
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
          <Text style={s.emptyText}>{t('management.no_providers')}</Text>
        }
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateProvider')}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};
