import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { marqueService, MarqueDTO } from '../../marques/api/marqueService';
import { useTheme } from '../../../theme/ThemeContext';
import { createManagementStyles } from '../styles/managementStyles';
import { useTranslation } from 'react-i18next';

interface Props {
  isActive: boolean;
}

export const MarquesPanel: React.FC<Props> = ({ isActive }) => {
  const theme = useTheme();
  const s = createManagementStyles(theme);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [items, setItems] = useState<MarqueDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await marqueService.getAll());
    } catch {
      Alert.alert(t('common.error'), t('management.load_marques_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() =>
              navigation.navigate('MarqueDetail', { marqueId: item.id })
            }
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {item.imageSmall ? (
                <Image
                  source={{
                    uri: `data:image/jpeg;base64,${item.imageSmall}`,
                  }}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    marginRight: 12,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    marginRight: 12,
                    backgroundColor: '#E2E8F0',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#64748B' }}>
                    {item.title.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={s.cardHeader}>
                  <Text style={s.title}>{item.title}</Text>
                  {item.type ? <Text style={s.badge}>{item.type}</Text> : null}
                </View>
                {item.description ? (
                  <Text style={s.subtitle} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={s.emptyText}>{t('management.no_marques')}</Text>
        }
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateMarque')}
      >
        <Text style={s.fabText}>+</Text>
         </TouchableOpacity>
    </View>
  );
};
