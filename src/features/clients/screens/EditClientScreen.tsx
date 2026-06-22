import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { clientService } from '../api/clientService';
import { theme } from '../../../theme';
import { useTranslation } from 'react-i18next';

export const EditClientScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const clientId = route.params?.clientId as number;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    company: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    clientService
      .getById(clientId)
      .then(client => {
        setForm({
          name: client.name,
          description: client.description || '',
          company: client.company || '',
          city: client.city || '',
          address: client.address || '',
        });
      })
      .catch(() => {
        Alert.alert(t('common.error'), 'Failed to load client.');
        navigation.goBack();
      })
      .finally(() => setFetching(false));
  }, [clientId, navigation]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('common.error'), 'Name is required');
      return;
    }

    setLoading(true);
    try {
      await clientService.update(clientId, form);
      Alert.alert(t('common.success'), 'Client updated.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Check your backend connection');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>{t('common.name')}</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={text => setForm({ ...form, name: text })}
      />

      <Text style={styles.label}>{t('common.company')}</Text>
      <TextInput
        style={styles.input}
        value={form.company}
        onChangeText={text => setForm({ ...form, company: text })}
      />

      <Text style={styles.label}>{t('common.description')}</Text>
      <TextInput
        style={styles.input}
        value={form.description}
        onChangeText={text => setForm({ ...form, description: text })}
        multiline
      />

      <Text style={styles.label}>{t('common.city')}</Text>
      <TextInput
        style={styles.input}
        value={form.city}
        onChangeText={text => setForm({ ...form, city: text })}
      />

      <Text style={styles.label}>{t('common.address')}</Text>
      <TextInput
        style={styles.input}
        value={form.address}
        onChangeText={text => setForm({ ...form, address: text })}
        multiline
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>{t('common.save')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
