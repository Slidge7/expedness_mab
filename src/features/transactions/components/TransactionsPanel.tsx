import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { transactionService, TransactionDTO } from '../api/transactionService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { Card } from '../../../components/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

interface Props {
  type: 'INCOME' | 'EXPENSE';
  isActive: boolean;
}

export const TransactionsPanel: React.FC<Props> = ({ type, isActive }) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [data, setData] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = createStyles(theme);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getAll();
      setData(
        res
          .filter(tx => tx.type === type)
          .sort(
            (a, b) =>
              new Date(b.transactionDate).getTime() -
              new Date(a.transactionDate).getTime(),
          ),
      );
    } catch (e) {
      console.error('Failed to fetch transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) loadData();
  }, [isActive, type]);

  const isIncome = type === 'INCOME';
  const accentColor = isIncome ? theme.colors.success : theme.colors.danger;

  const renderItem = useCallback(
    ({ item }: { item: TransactionDTO }) => (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() =>
        navigation.navigate('TransactionDetail', { transactionId: item.id })
      }
    >
      <Card style={styles.cardItem} noPadding>
        <View style={[styles.accent, { backgroundColor: accentColor }]} />

        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <Text style={styles.desc} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={[styles.amount, { color: accentColor }]}>
              {isIncome ? '+' : '-'}${item.totalAmount?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.date}>
              {new Date(item.transactionDate).toLocaleDateString()} ·{' '}
              {t('transaction.items_count', { count: item.items?.length || 0 })}
            </Text>
            <Text style={styles.createdBy}>
              {item.createdBy || t('transaction.system')}
            </Text>
          </View>

          <View style={styles.badges}>
            {item.fuelTank && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.badgeText}>{item.fuelTank.toUpperCase()}</Text>
              </View>
            )}
            {item.category && (
              <View style={[styles.badge, { backgroundColor: theme.colors.secondary }]}>
                <Text style={styles.badgeTextDark}>{item.category}</Text>
              </View>
            )}
            {item.clientName && (
              <View style={[styles.badge, { backgroundColor: theme.colors.border }]}>
                <Text style={styles.badgeTextDark}>
                  {t('transaction.client_label', { name: item.clientName })}
                </Text>
              </View>
            )}
            {item.providerName && (
              <View style={[styles.badge, { backgroundColor: theme.colors.border }]}>
                <Text style={styles.badgeTextDark}>
                  {t('transaction.provider_label', { name: item.providerName })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
    ),
    [navigation, accentColor, isIncome, t],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.id?.toString() ?? `fallback-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listPadding}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>
                {type === 'INCOME'
                  ? t('transaction.no_income')
                  : t('transaction.no_expense')}
              </Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTransaction', { initialType: type })}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listPadding: { paddingBottom: 100, paddingTop: theme.spacing.m, paddingHorizontal: theme.spacing.m },
  cardItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.s,
    overflow: 'hidden',
  },
  accent: { width: 6 },
  cardBody: { flex: 1, padding: theme.spacing.m },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  desc: { fontSize: 16, fontWeight: '700', color: theme.colors.text, flex: 1 },
  amount: { fontSize: 18, fontWeight: '800' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  date: { fontSize: 13, color: theme.colors.textSecondary },
  createdBy: { fontSize: 12, color: theme.colors.textSecondary, textTransform: 'uppercase' },
  badges: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.m,
  },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '700', textTransform: 'uppercase' },
  badgeTextDark: { fontSize: 11, color: theme.colors.text, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 80, gap: 16 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: '500' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
});
