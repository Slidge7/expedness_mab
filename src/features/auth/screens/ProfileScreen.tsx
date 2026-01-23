import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutUser } from '../../../store/authSlice';
import { theme } from '../../../theme';

export const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          // This clears Redux + AsyncStorage, triggering the AppNavigator to switch to Login
          dispatch(logoutUser());
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username || 'Guest User'}</Text>
        <Text style={styles.role}>Administrator</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.username}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>App Version</Text>
          <Text style={styles.value}>v1.0.0 (Beta)</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
  },
  avatarText: { fontSize: 28, color: '#FFF', fontWeight: 'bold' },
  username: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  role: { fontSize: 14, color: '#64748B', marginTop: 4 },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: { fontSize: 16, color: '#334155' },
  value: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 16 },
});
