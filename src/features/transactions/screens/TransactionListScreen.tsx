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

export const TransactionListScreen = () => {
  const navigation = useNavigation<any>();
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
            { backgroundColor: isIncome ? '#10B981' : '#EF4444' },
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
                { color: isIncome ? '#10B981' : '#EF4444' },
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
              {item.items?.length || 0} items
            </Text>
            <Text style={styles.createdBy}>{item.createdBy || 'System'}</Text>
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
                  Mission #{item.missionId}
                </Text>
              </View>
            )}
            {item.clientName && (
              <View style={styles.badgeGray}>
                <Text style={styles.badgeTextDark}>Client: {item.clientName}</Text>
              </View>
            )}
            {item.providerName && (
              <View style={styles.badgeGray}>
                <Text style={styles.badgeTextDark}>
                  Provider: {item.providerName}
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
              <Text style={styles.emptyText}>No transactions found.</Text>
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
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  listPadding: { paddingBottom: 100, paddingTop: 8 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  desc: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  date: { fontSize: 12, color: '#64748B' },
  createdBy: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase' },

  badges: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  badgeDark: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgePurple: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeGray: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextDark: { fontSize: 10, color: '#475569', fontWeight: '600' },

  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94A3B8', fontSize: 16 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: { color: '#FFF', fontSize: 30, fontWeight: '300' },
});
