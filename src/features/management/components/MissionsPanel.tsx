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
import { missionService, MissionDTO } from '../../missions/api/missionService';
import { theme } from '../../../theme';
import { managementStyles as s } from '../styles/managementStyles';
import { useTranslation } from 'react-i18next';

interface Props {
  isActive: boolean;
}

export const MissionsPanel: React.FC<Props> = ({ isActive }) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [items, setItems] = useState<MissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await missionService.getAll());
    } catch {
      Alert.alert(t('common.error'), 'Failed to load missions.');
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
              navigation.navigate('MissionDetail', { missionId: item.id })
            }
          >
            <View style={s.cardHeader}>
              <Text style={s.title}>{item.title}</Text>
              <View
                style={[
                  s.statusBadge,
                  {
                    backgroundColor:
                      item.status === 'COMPLETED' ? '#D1FAE5' : '#FEF3C7',
                  },
                ]}
              >
                <Text style={s.statusText}>{item.status}</Text>
              </View>
            </View>
            {item.description ? (
              <Text style={s.subtitle} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            {(item.clientName || item.providerName) && (
              <Text style={s.meta}>
                {[item.clientName, item.providerName].filter(Boolean).join(' · ')}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={s.emptyText}>{t('management.no_missions')}</Text>
        }
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateMission')}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};
