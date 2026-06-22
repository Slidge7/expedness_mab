import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useIsFocused,
} from '@react-navigation/native';
import { transactionService, TransactionDTO } from '../api/transactionService';
import { DEFAULT_ITEM_CATEGORY } from '../../items/constants';
import { formatMoney } from '../utils/discountUtils';
import { theme } from '../../../theme';
import { useTranslation } from 'react-i18next';

type RouteParams = { transactionId: number };

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value ?? '—'}</Text>
  </View>
);

export const TransactionDetailScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const isFocused = useIsFocused();
  const { transactionId } = route.params;

  const [tx, setTx] = useState<TransactionDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionService.getById(transactionId);
      setTx(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load transaction.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const handleDelete = () => {
    Alert.alert(
      t('transaction.delete_transaction'),
      t('transaction.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await transactionService.delete(transactionId);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete transaction.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!tx) return null;

  const isIncome = tx.type === 'INCOME';
  const formattedDate = tx.transactionDate
    ? new Date(tx.transactionDate).toLocaleString()
    : '—';

  const formatCategory = (category?: string) => {
    if (!category || category === DEFAULT_ITEM_CATEGORY) return t('items.other');
    return category;
  };

  const hasDiscount = (tx.discountAmount ?? 0) > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* ── Header card ── */}
        <View
          style={[
            styles.headerCard,
            isIncome ? styles.headerIncome : styles.headerExpense,
          ]}
        >
          <Text style={styles.headerAmount}>
            {isIncome ? '+' : '-'}
            {tx.totalAmount?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <View style={styles.headerMeta}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tx.type}</Text>
            </View>
            {tx.fuelTank && (
              <View style={[styles.badge, styles.badgeDark]}>
                <Text style={styles.badgeText}>
                  {tx.fuelTank?.toUpperCase()}
                </Text>
              </View>
            )}
            {tx.category && (
              <View style={[styles.badge, styles.badgePurple]}>
                <Text style={styles.badgeText}>{formatCategory(tx.category)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerDesc}>{tx.description}</Text>
        </View>

        {/* ── Info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('transaction.transaction_info')}</Text>
          <InfoRow label={t('transaction.date')} value={formattedDate} />
          <InfoRow label={t('transaction.created_by')} value={tx.createdBy} />
          <InfoRow
            label={t('transaction.mission')}
            value={tx.missionId ? `#${tx.missionId}` : null}
          />
          <InfoRow
            label={t('transaction.location')}
            value={tx.locationId ? `#${tx.locationId}` : null}
          />
          <InfoRow
            label={t('transaction.client')}
            value={tx.clientName ?? (tx.clientId ? `#${tx.clientId}` : null)}
          />
          <InfoRow
            label={t('transaction.provider')}
            value={tx.providerName ?? (tx.providerId ? `#${tx.providerId}` : null)}
          />
        </View>

        {/* ── Items ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('transaction.items_total', { count: tx.items?.length || 0 })}
          </Text>

          {!tx.items?.length ? (
            <Text style={styles.emptyText}>{t('transaction.no_items')}</Text>
          ) : (
            tx.items.map((item, index) => (
              <View key={item.id ?? index} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemCategory}>
                    {item.itemName || formatCategory(item.category)}
                  </Text>
                  {item.reason ? (
                    <Text style={styles.itemReason}>{item.reason}</Text>
                  ) : null}
                  {item.notes ? (
                    <Text style={styles.itemNotes}>{item.notes}</Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemMath}>
                    {item.quantity} × {item.unitPrice}
                  </Text>
                  <Text style={styles.itemTotal}>
                    ${formatMoney(
                      item.amount ?? item.quantity * item.unitPrice,
                    )}
                  </Text>
                </View>
              </View>
            ))
          )}

          {hasDiscount && (
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>
                {t('transaction.discount')}
                {tx.discountType === 'PERCENT' && tx.discountValue
                  ? ` (${tx.discountValue}%)`
                  : tx.discountType === 'FIXED' && tx.discountValue
                    ? ` ($${tx.discountValue})`
                    : ''}
              </Text>
              <Text style={styles.discountValue}>
                −${formatMoney(tx.discountAmount ?? 0)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('transaction.total')}</Text>
            <Text
              style={[
                styles.totalValue,
                { color: isIncome ? '#10B981' : '#EF4444' },
              ]}
            >
              {tx.totalAmount?.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Actions ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate('EditTransaction', { transactionId: tx.id })
          }
        >
          <Text style={styles.editText}>{t('common.edit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, deleting && { opacity: 0.5 }]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Text style={styles.deleteText}>
            {deleting ? t('common.deleting') : t('common.delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerCard: {
    padding: 28,
    paddingTop: 36,
  },
  headerIncome: { backgroundColor: '#ECFDF5' },
  headerExpense: { backgroundColor: '#FEF2F2' },
  headerAmount: {
    fontSize: 38,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 10,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeDark: { backgroundColor: '#0F172A' },
  badgePurple: { backgroundColor: '#7C3AED' },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  headerDesc: { fontSize: 16, color: '#475569', marginTop: 4 },

  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 10,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  infoValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  itemCategory: { fontWeight: '700', fontSize: 14, color: '#334155' },
  itemReason: { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemNotes: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemMath: { fontSize: 12, color: '#64748B' },
  itemTotal: { fontWeight: '800', color: '#1E293B', fontSize: 15 },

  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  discountLabel: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  discountValue: { fontSize: 15, fontWeight: '700', color: '#EF4444' },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 2,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  totalValue: { fontSize: 22, fontWeight: '900' },

  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  editBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  deleteText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});
