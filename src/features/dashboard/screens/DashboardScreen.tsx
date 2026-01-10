import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../theme';

// REDUX IMPORTS
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutUser } from '../../../store/authSlice';

export const DashboardScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.info}>Dashboard is under construction 🚧</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
  },
  header: { marginBottom: theme.spacing.xl },
  welcomeText: { fontSize: 16, color: theme.colors.textSecondary },
  username: { fontSize: 32, fontWeight: '700', color: theme.colors.primary },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  info: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: 40 },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#EF4444',
    borderRadius: theme.radius,
  },
  logoutText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});
