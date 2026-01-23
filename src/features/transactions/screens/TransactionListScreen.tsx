import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
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
      // Ensure the data is sorted by date (newest first)
      const sortedData = res.sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      );
      setData(sortedData);
    } catch (e) {
      console.error('Failed to fetch transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  const renderItem = ({ item }: { item: TransactionDTO }) => (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <Text style={styles.desc} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.subText}>
          {new Date(item.transactionDate).toLocaleDateString()} •{' '}
          {item.items?.length || 0} Items
        </Text>
        {item.missionId && (
          <View style={styles.missionBadge}>
            <Text style={styles.missionText}>Mission #{item.missionId}</Text>
          </View>
        )}
      </View>

      <View style={styles.rightCol}>
        <Text
          style={[
            styles.amount,
            { color: item.type === 'INCOME' ? '#10B981' : '#EF4444' },
          ]}
        >
          {item.type === 'INCOME' ? '+' : '-'}$
          {item.totalAmount?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text style={styles.createdBy}>By {item.createdBy || 'System'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
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
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  listPadding: {
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftCol: {
    flex: 1,
    marginRight: 10,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  desc: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
  },
  createdBy: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  missionBadge: {
    backgroundColor: '#E2E8F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
  },
  missionText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
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
  fabText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: '300',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
  },
});
