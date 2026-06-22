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
import { providerService, ProviderDTO } from '../api/providerService';
import { theme } from '../../../theme';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export const ProviderListScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [providers, setProviders] = useState<ProviderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProviders = async () => {
    try {
      const data = await providerService.getAll();
      setProviders(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch providers.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) fetchProviders();
  }, [isFocused]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProviders();
  }, []);

  const renderItem = ({ item }: { item: ProviderDTO }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ProviderDetail', { providerId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        {item.city ? <Text style={styles.badge}>{item.city}</Text> : null}
      </View>
      {item.company ? (
        <Text style={styles.subtitle}>{item.company}</Text>
      ) : null}
      {item.address ? <Text style={styles.address}>{item.address}</Text> : null}
    </TouchableOpacity>
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
        data={providers}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {t('management.no_providers')}
          </Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProvider')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { fontSize: 18, fontWeight: '700', color: '#1E293B', flex: 1 },
  badge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    color: '#475569',
  },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  address: { fontSize: 13, color: '#94A3B8' },
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
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: '300' },
});
