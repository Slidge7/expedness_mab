import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutUser } from '../../../store/authSlice';
import { confirmAction } from '../../../utils/confirmAction';
import { useTheme } from '../../../theme/ThemeContext';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppTheme } from '../../../theme';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

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
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('nav.settings')}</Text>
        <View style={styles.menuButtonSpacer} />
      </View>
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
          <Text style={styles.sectionTitle}>{t('appearance.title')}</Text>
          <View style={styles.themeRow}>
            <View style={styles.themeLabel}>
              <Ionicons
                name={theme.isDark ? 'moon' : 'sunny'}
                size={20}
                color={theme.colors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.label}>{t('appearance.dark_mode')}</Text>
            </View>
            <Switch
              value={theme.isDark}
              onValueChange={theme.toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language.switch_prompt')}</Text>
          <View style={styles.languageRow}>
            <LanguageSwitcher />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('auth.log_out')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    menuButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuButtonSpacer: {
      width: 40,
    },
    topBarTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
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
    username: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
    role: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: 16,
      textTransform: 'uppercase',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    label: { fontSize: 16, color: theme.colors.text },
    value: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    themeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    themeLabel: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    languageRow: {
      paddingVertical: 8,
      alignItems: 'flex-start',
    },
    logoutButton: {
      backgroundColor: theme.isDark ? '#450A0A' : '#FEF2F2',
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.isDark ? '#7F1D1D' : '#FEE2E2',
    },
    logoutText: { color: theme.colors.danger, fontWeight: '700', fontSize: 16 },
  });
