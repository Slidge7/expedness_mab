import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { transactionService, TransactionDTO } from '../api/transactionService';
import { theme } from '../../../theme';
import { useTranslation } from 'react-i18next';

export const TransactionListScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [data, setData] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getAll();
      setData(
        res.sort(
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
    if (isFocused) loadData();
  }, [isFocused]);

  const renderItem = ({ item }: { item: TransactionDTO }) => {
    const isIncome = item.type === 'INCOME';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate('TransactionDetail', { transactionId: item.id })
        }
      >
        {/* Left accent bar */}
        <View
          style={[
            styles.accent,
            { backgroundColor: isIncome ? theme.colors.success : theme.colors.danger },
          ]}
        />

        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <Text style={styles.desc} numberOfLines={1}>
              {item.description}
            </Text>
            <Text
              style={[
                styles.amount,
                { color: isIncome ? theme.colors.success : theme.colors.danger },
              ]}
            >
              {isIncome ? '+' : '-'}
              {item.totalAmount?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.date}>
              {new Date(item.transactionDate).toLocaleDateString()} ·{' '}
              {t('transaction.items_total', { count: item.items?.length || 0 })}
            </Text>
            <Text style={styles.createdBy}>{item.createdBy || t('transaction.system')}</Text>
          </View>

          {/* Badges */}
          <View style={styles.badges}>
            {item.fuelTank && (
              <View style={styles.badgeDark}>
                <Text style={styles.badgeText}>
                  {item.fuelTank.toUpperCase()}
                </Text>
              </View>
            )}
            {item.category && (
              <View style={styles.badgePurple}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
            )}
            {item.missionId && (
              <View style={styles.badgeGray}>
                <Text style={styles.badgeTextDark}>
                  {t('transaction.mission')} #{item.missionId}
                </Text>
              </View>
            )}
            {item.clientName && (
              <View style={styles.badgeGray}>
                <Text style={styles.badgeTextDark}>{t('transaction.client')}: {item.clientName}</Text>
              </View>
            )}
            {item.providerName && (
              <View style={styles.badgeGray}>
                <Text style={styles.badgeTextDark}>
                  {t('transaction.provider')}: {item.providerName}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
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
              <Text style={styles.emptyText}>{t('transaction.no_transactions')}</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTransaction')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listPadding: { paddingBottom: 100, paddingTop: theme.spacing.m },

  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderRadius: theme.radius.l,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  accent: {
    width: 6,
  },
  cardBody: {
    flex: 1,
    padding: theme.spacing.m,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.s,
  },
  desc: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  date: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
  createdBy: { fontSize: 12, color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '700' },

  badges: { flexDirection: 'row', gap: 8, marginTop: theme.spacing.m, flexWrap: 'wrap' },
  badgeDark: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  badgePurple: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  badgeGray: {
    backgroundColor: theme.colors.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  badgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextDark: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '700', letterSpacing: 0.5 },

  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 50 },
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
    ...theme.shadows.lg,
  },
  fabText: { color: '#FFF', fontSize: 32, fontWeight: '400', marginTop: -2 },
});
