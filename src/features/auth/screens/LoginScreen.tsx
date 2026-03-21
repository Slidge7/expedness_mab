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
import { authService } from '../api/authService';
import apiClient from '../../../api/client';
import { theme } from '../../../theme';

// REDUX IMPORTS
import { useAppDispatch } from '../../../store/hooks';
import { loginSuccess } from '../../../store/authSlice';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      // 1. API Call
      const data = await authService.login({ username, password });

      // 2. Dispatch to Redux (Updates State + Saves to Storage)
      await dispatch(loginSuccess(data));

      // Navigation happens automatically via AppNavigator
    } catch (error: any) {
      console.log('Login Error:', error);
      const msg =
        error.response?.status === 401
          ? 'Invalid Username or Password'
          : 'Network Error. Check your connection.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      console.log('Testing connection...');
      const response = await apiClient.get('/api/auth/test');
      if (Platform.OS === 'web') {
        window.alert(`✅ Connection OK\nBackend says: "${response.data}"`);
      } else {
        Alert.alert('✅ Connection OK', `Backend says: "${response.data}"`);
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(
          `❌ Connection Failed\n${error.message || 'Unknown error'}`,
        );
      } else {
        Alert.alert('❌ Connection Failed', error.message || 'Unknown error');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Expedness ERP</Text>
          <Text style={styles.subtitle}>Sign in to your workspace</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="jdo2e"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
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
              <Text style={styles.buttonText}>Access Dashboard</Text>
            )}
          </TouchableOpacity>

          {/* Navigation to Register */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Backend Test Button */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestConnection}
          >
            <Text style={styles.testButtonText}>⚠️ RUN BACKEND TEST</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#F8FAFC',
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
