import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTransactions } from '../../../store/transactionSlice';
import { theme } from '../../../theme';

export const DashboardScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { totalBalance, items } = useAppSelector(state => state.transactions);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hello, {user?.username}</Text>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: totalBalance >= 0 ? '#FFF' : '#FECACA' },
            ]}
          >
            ${totalBalance.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Transactions</Text>
          <Text style={styles.statValue}>{items.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>Active</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcome: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 10 },
  balanceCard: { marginTop: 10 },
  balanceLabel: { color: '#FFF', fontSize: 14, opacity: 0.9 },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: '800' },
  statsRow: { flexDirection: 'row', padding: 20, gap: 15, marginTop: -20 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statLabel: { color: '#64748B', fontSize: 12, marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
});
