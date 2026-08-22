import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Share,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchCatalogById,
  fetchCatalogOrders,
  updateOrderStatus,
} from '../../../store/catalogSlice';
import {
  buildCatalogShareUrl,
  CatalogOrderDTO,
  CatalogOrderStatus,
} from '../api/catalogService';
import { contactTypeLabel } from '../utils/contactLinks';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

const STATUS_OPTIONS: CatalogOrderStatus[] = ['PENDING', 'VIEWED', 'COMPLETED'];

export const CatalogDetailScreen = () => {
  const theme = useTheme();
  const s = getStyles(theme);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const catalogId = route.params?.catalogId as number;
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { selectedCatalog, orders, loading } = useAppSelector(state => state.catalogs);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    Promise.all([
      dispatch(fetchCatalogById(catalogId)),
      dispatch(fetchCatalogOrders(catalogId)),
    ]).finally(() => setRefreshing(false));
  };

  useEffect(() => {
    if (isFocused) load();
  }, [catalogId, isFocused]);

  const handleShare = async () => {
    if (!selectedCatalog?.token) return;
    const url = buildCatalogShareUrl(selectedCatalog.token);
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

  const changeStatus = async (order: CatalogOrderDTO, status: CatalogOrderStatus) => {
    await dispatch(updateOrderStatus({ orderId: order.id, status }));
  };

  if (loading && !selectedCatalog) {
    return (
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      <View style={s.card}>
        <Text style={s.title}>{selectedCatalog?.name}</Text>
        {selectedCatalog?.description ? (
          <Text style={s.meta}>{selectedCatalog.description}</Text>
        ) : null}
        <Text style={s.meta}>
          {selectedCatalog?.itemNames?.length || 0} items ·{' '}
          {selectedCatalog ? contactTypeLabel(selectedCatalog.contactType) : ''}:{' '}
          {selectedCatalog?.contactValue}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <TouchableOpacity style={s.btnPrimary} onPress={handleShare}>
            <Text style={s.btnText}>Share link</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => navigation.navigate('EditCatalog', { catalogId })}
          >
            <Text style={s.btnTextDark}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={s.sectionTitle}>Orders ({orders.length})</Text>
      {orders.length === 0 ? (
        <Text style={s.meta}>No orders yet. Share the link with clients.</Text>
      ) : (
        orders.map(order => (
          <View key={order.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.title}>{order.clientName}</Text>
              <Text style={s.badge}>{order.status}</Text>
            </View>
            <Text style={s.meta}>
              {new Date(order.submittedAt).toLocaleString()} · Total:{' '}
              {order.totalAmount?.toFixed(2)}
            </Text>
            {order.clientNote ? (
              <Text style={s.meta}>Note: {order.clientNote}</Text>
            ) : null}
            {order.items?.map(line => (
              <Text key={`${order.id}-${line.itemId}`} style={s.meta}>
                · {line.itemName} x {line.quantity} = {line.subtotal?.toFixed(2)}
              </Text>
            ))}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {STATUS_OPTIONS.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    s.statusChip,
                    order.status === status && s.statusChipActive,
                  ]}
                  onPress={() => changeStatus(order, status)}
                >
                  <Text
                    style={[
                      s.statusChipText,
                      order.status === status && s.statusChipTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {(order.clientId != null || order.transactionId != null) && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {order.clientId != null && (
                  <TouchableOpacity
                    style={s.linkBtn}
                    onPress={() =>
                      navigation.navigate('ClientDetail', { clientId: order.clientId })
                    }
                  >
                    <Text style={s.linkBtnText}>{t('catalog.view_client')}</Text>
                  </TouchableOpacity>
                )}
                {order.transactionId != null && (
                  <TouchableOpacity
                    style={s.linkBtn}
                    onPress={() =>
                      navigation.navigate('TransactionDetail', {
                        transactionId: order.transactionId,
                      })
                    }
                  >
                    <Text style={s.linkBtnText}>{t('catalog.view_sale')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const getStyles = (theme: AppTheme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: { fontSize: 18, fontWeight: '700' as const, color: theme.colors.text },
  meta: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden' as const,
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnSecondary: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: { color: '#fff', fontWeight: '600' as const },
  btnTextDark: { color: theme.colors.text, fontWeight: '600' as const },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.inputBg,
  },
  statusChipActive: { backgroundColor: theme.colors.primary },
  statusChipText: { fontSize: 12, fontWeight: '600' as const, color: theme.colors.textSecondary },
  statusChipTextActive: { color: '#fff' },
  linkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  linkBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
});
