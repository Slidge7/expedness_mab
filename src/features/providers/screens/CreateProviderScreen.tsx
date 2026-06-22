import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { providerService } from '../api/providerService';
import { theme } from '../../../theme';
import { useTranslation } from 'react-i18next';

export const CreateProviderScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    company: '',
    city: '',
    address: '',
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('common.error'), 'Name is required');
      return;
    }

    setLoading(true);
    try {
      await providerService.create(form);
      Alert.alert(t('common.success'), 'Provider created successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Check your backend connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>{t('common.name')}</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={text => setForm({ ...form, name: text })}
        placeholder="Provider name"
      />

      <Text style={styles.label}>{t('common.company')}</Text>
      <TextInput
        style={styles.input}
        value={form.company}
        onChangeText={text => setForm({ ...form, company: text })}
        placeholder="Legal or display name"
      />

      <Text style={styles.label}>{t('common.description')}</Text>
      <TextInput
        style={styles.input}
        value={form.description}
        onChangeText={text => setForm({ ...form, description: text })}
        placeholder="Optional notes"
        multiline
      />

      <Text style={styles.label}>{t('common.city')}</Text>
      <TextInput
        style={styles.input}
        value={form.city}
        onChangeText={text => setForm({ ...form, city: text })}
        placeholder="City"
      />

      <Text style={styles.label}>{t('common.address')}</Text>
      <TextInput
        style={styles.input}
        value={form.address}
        onChangeText={text => setForm({ ...form, address: text })}
        placeholder="Street address"
        multiline
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>{t('common.save')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>{t('common.cancel')}</Text>
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
  cancelButton: { padding: 16, alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: '600' },
});
