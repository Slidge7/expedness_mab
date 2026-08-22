import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Share,
  Platform,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCatalogs, deleteCatalog } from '../../../store/catalogSlice';
import {
  buildCatalogShareUrl,
  CatalogDTO,
} from '../api/catalogService';
import { contactTypeLabel } from '../utils/contactLinks';
import { useTheme } from '../../../theme/ThemeContext';
import { createManagementStyles } from '../../management/styles/managementStyles';

interface Props {
  isActive?: boolean;
}

export const CatalogListScreen: React.FC<Props> = ({ isActive = true }) => {
  const theme = useTheme();
  const s = createManagementStyles(theme);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { catalogs, loading } = useAppSelector(state => state.catalogs);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    dispatch(fetchCatalogs()).finally(() => setRefreshing(false));
  };

  useEffect(() => {
    if (isActive && isFocused) load();
  }, [isActive, isFocused]);

  const handleShare = async (catalog: CatalogDTO) => {
    if (!catalog.token) return;
    const url = buildCatalogShareUrl(catalog.token);
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        Alert.alert('Link copied', url);
        return;
      }
      await Share.share({ message: url, url });
    } catch {
      Alert.alert('Share link', url);
    }
  };

  const handleDelete = (catalog: CatalogDTO) => {
    Alert.alert('Delete catalog', `Remove "${catalog.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!catalog.id) return;
          await dispatch(deleteCatalog(catalog.id));
        },
      },
    ]);
  };

  if (loading && catalogs.length === 0 && isActive) {
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
        data={catalogs}
        keyExtractor={item => item.id?.toString() || item.token || Math.random().toString()}
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
          <View style={s.card}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CatalogDetail', { catalogId: item.id })
              }
            >
              <View style={s.cardHeader}>
                <Text style={s.title}>{item.name}</Text>
                <Text style={[s.badge, !item.active && { backgroundColor: '#FEE2E2', color: '#B91C1C' }]}>
                  {item.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              {item.description ? (
                <Text style={s.subtitle} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <Text style={s.meta}>
                {item.itemNames?.length || 0} items · {contactTypeLabel(item.contactType)}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                style={[shareBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleShare(item)}
              >
                <Text style={shareBtnText}>Share link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[shareBtn, { backgroundColor: '#64748B' }]}
                onPress={() =>
                  navigation.navigate('EditCatalog', { catalogId: item.id })
                }
              >
                <Text style={shareBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[shareBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => handleDelete(item)}
              >
                <Text style={shareBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={s.emptyText}>
            No catalogs yet. Create one to share products with clients.
          </Text>
        }
      />
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateCatalog')}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const shareBtn = {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
};

const shareBtnText = {
  color: '#fff',
  fontWeight: '600' as const,
  fontSize: 13,
};
