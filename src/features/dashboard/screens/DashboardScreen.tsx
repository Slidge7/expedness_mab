import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/useAuthStore';
import { theme } from '../../../theme';

export const DashboardScreen = () => {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.username || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ERP Stat Cards */}
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Revenue</Text>
            <Text style={styles.cardValue}>$124,500</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Active Orders</Text>
            <Text style={styles.cardValue}>45</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.listRow}>
            <Text style={styles.rowText}>New Order #1023</Text>
            <Text style={styles.rowStatus}>Pending</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.l,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  welcomeText: { color: theme.colors.textSecondary, fontSize: 14 },
  userName: { color: theme.colors.primary, fontSize: 20, fontWeight: '700' },
  logoutBtn: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius,
  },
  logoutText: { color: theme.colors.text, fontWeight: '600' },
  content: { padding: theme.spacing.l },
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.radius,
    elevation: 2,
  },
  cardLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  section: { gap: theme.spacing.m },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
  },
  rowText: { color: theme.colors.text, fontWeight: '500' },
  rowStatus: { color: '#F59E0B', fontWeight: '700', fontSize: 12 },
});
