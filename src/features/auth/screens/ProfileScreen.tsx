import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutUser } from '../../../store/authSlice';
import { confirmAction } from '../../../utils/confirmAction';
import { theme } from '../../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const { t } = useTranslation();

  const handleLogout = () => {
    confirmAction(
      t('auth.log_out'),
      t('auth.log_out_confirm'),
      () => {
        dispatch(logoutUser());
      },
      t('auth.log_out'),
      t('common.cancel'),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </Text>
          </View>
          <Text style={styles.username}>
            {user?.username || t('auth.guest_user')}
          </Text>
          <Text style={styles.role}>{t('auth.administrator')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('auth.account')}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('auth.username')}</Text>
            <Text style={styles.value}>{user?.username}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('auth.app_version')}</Text>
            <Text style={styles.value}>{t('auth.version_value')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('nav.management')}</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Management')}
          >
            <View style={styles.menuRowLeft}>
              <Ionicons name="briefcase-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.menuLabel}>{t('nav.manage')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('auth.log_out')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { padding: 20, paddingBottom: 40 },
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: { fontSize: 16, fontWeight: '600', color: '#334155' },
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
