import React, { useEffect, useState, useCallback } from 'react';
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
      const res = await transactionService.getAll();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={item => item.id?.toString()!}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.date}>
                {new Date(item.transactionDate).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                styles.amount,
                { color: item.type === 'INCOME' ? '#10B981' : '#EF4444' },
              ]}
            >
              {item.type === 'INCOME' ? '+' : '-'}${item.amount}
            </Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTransaction')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    elevation: 2,
  },
  desc: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  date: { fontSize: 12, color: '#64748B', marginTop: 4 },
  amount: { fontSize: 18, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { color: '#FFF', fontSize: 24 },
});
