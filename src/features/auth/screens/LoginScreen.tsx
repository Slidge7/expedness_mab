import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { authService } from '../api/authService';
import apiClient from '../../../api/client';
import { DEMO_ACCOUNT } from '../demoAccount';
import {
  ensureDemoAccountRegistered,
  ensureDemoStockData,
} from '../demoSeedService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';

// REDUX IMPORTS
import { useAppDispatch } from '../../../store/hooks';
import { loginSuccess } from '../../../store/authSlice';

export const LoginScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(t('common.error'), t('auth.enter_credentials'));
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login({ username, password });
      await dispatch(loginSuccess(data));
    } catch (error: any) {
      console.log('Login Error:', error);
      const msg =
        error.response?.status === 401
          ? t('auth.invalid_credentials')
          : t('auth.network_error');
      if (Platform.OS === 'web') {
        window.alert(`${t('auth.login_failed')}\n${msg}`);
      } else {
        Alert.alert(t('auth.login_failed'), msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setUsername(DEMO_ACCOUNT.username);
    setPassword(DEMO_ACCOUNT.password);
    setLoading(true);
    try {
      const auth = await ensureDemoAccountRegistered();
      await dispatch(loginSuccess(auth));
      await ensureDemoStockData();
    } catch (error: any) {
      const msg =
        error.response?.status === 401
          ? t('auth.demo_login_failed_after_register')
          : error.message || t('auth.network_error_backend');
      if (Platform.OS === 'web') {
        window.alert(`${t('auth.demo_login_failed')}\n${msg}`);
      } else {
        Alert.alert(t('auth.demo_login_failed'), msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      console.log('Testing connection...');
      const response = await apiClient.get('/api/auth/test');
      const backendMsg = t('auth.backend_says', { message: response.data });
      if (Platform.OS === 'web') {
        window.alert(`${t('auth.connection_ok')}\n${backendMsg}`);
      } else {
        Alert.alert(t('auth.connection_ok'), backendMsg);
      }
    } catch (error: any) {
      const errMsg = error.message || t('auth.unknown_error');
      if (Platform.OS === 'web') {
        window.alert(`${t('auth.connection_failed')}\n${errMsg}`);
      } else {
        Alert.alert(t('auth.connection_failed'), errMsg);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.app_title')}</Text>
          <Text style={styles.subtitle}>{t('auth.sign_in_subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t('auth.username')}</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder={t('auth.username')}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t('auth.password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.access_dashboard')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>{t('auth.use_demo_account')}</Text>
          </TouchableOpacity>

          {/* Navigation to Register */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              {t('auth.no_account')}{' '}
              <Text style={styles.linkBold}>{t('auth.sign_up')}</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Backend Test Button */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestConnection}
          >
            <Text style={styles.testButtonText}>{t('auth.run_backend_test')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    padding: theme.spacing.l,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.radius,
    elevation: 4,
  },
  header: { marginBottom: theme.spacing.xl, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.primary },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  form: { gap: theme.spacing.m },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    paddingHorizontal: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBg,
  },
  button: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.s,
  },
  buttonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  demoButton: {
    height: 44,
    borderRadius: theme.radius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: '#F0FDF4',
  },
  demoButtonText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
  linkButton: { marginTop: theme.spacing.m, alignItems: 'center' },
  linkText: { color: theme.colors.textSecondary, fontSize: 14 },
  linkBold: { color: theme.colors.primary, fontWeight: '700' },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.m,
  },
  testButton: {
    height: 40,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: theme.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonText: { color: '#D97706', fontWeight: '700', fontSize: 12 },
});
