import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clientService } from '../api/clientService';
import { theme } from '../../../theme';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTranslation } from 'react-i18next';

export const CreateClientScreen = () => {
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
      await clientService.create(form);
      Alert.alert(t('common.success'), 'Client created successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Check your backend connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.label}>{t('common.name')}</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={text => setForm({ ...form, name: text })}
          placeholder="Client name"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>{t('common.company')}</Text>
        <TextInput
          style={styles.input}
          value={form.company}
          onChangeText={text => setForm({ ...form, company: text })}
          placeholder="Legal or display name"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>{t('common.description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={text => setForm({ ...form, description: text })}
          placeholder="Optional notes"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />

        <Text style={styles.label}>{t('common.city')}</Text>
        <TextInput
          style={styles.input}
          value={form.city}
          onChangeText={text => setForm({ ...form, city: text })}
          placeholder="City"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>{t('common.address')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.address}
          onChangeText={text => setForm({ ...form, address: text })}
          placeholder="Street address"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />

        <View style={styles.actions}>
          <Button 
            title={t('common.save')} 
            onPress={handleSave} 
            loading={loading} 
            style={styles.saveBtn}
          />
          <Button 
            title={t('common.cancel')} 
            variant="outline" 
            onPress={() => navigation.goBack()} 
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.l, maxWidth: 600, alignSelf: 'center', width: '100%' },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.m,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 32,
    gap: 16,
  },
  saveBtn: {
    marginBottom: 0,
  },
});
