import React, { useState, useEffect } from 'react';
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
import { useAppDispatch } from '../../../../store/hooks';
import { fetchClients } from '../../../../store/clientSlice';
import { fetchProviders } from '../../../../store/providerSlice';
import { missionService } from '../missionService';
import { OptionalClientPicker } from '../../../transactions/components/OptionalClientPicker';
import { OptionalProviderPicker } from '../../../transactions/components/OptionalProviderPicker';
import { theme } from '../../../../theme';
import { useTranslation } from 'react-i18next';
import { translateMissionStatus } from '../../../../i18n/helpers';

export const EditMissionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const missionId = route.params?.missionId as number;
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
    clientId: null as number | null,
    providerId: null as number | null,
  });

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchProviders());
    missionService
      .getById(missionId)
      .then(m => {
        setForm({
          title: m.title,
          description: m.description || '',
          status: m.status,
          clientId: m.clientId ?? null,
          providerId: m.providerId ?? null,
        });
      })
      .catch(() => {
        Alert.alert(t('common.error'), t('missions.load_failed'));
        navigation.goBack();
      })
      .finally(() => setFetching(false));
  }, [missionId, dispatch, navigation, t]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert(t('common.error'), t('missions.title_required'));
      return;
    }

    setLoading(true);
    try {
      await missionService.update(missionId, {
        title: form.title,
        description: form.description,
        status: form.status,
        clientId: form.clientId ?? undefined,
        providerId: form.providerId ?? undefined,
      });
      Alert.alert(t('common.success'), t('missions.updated'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        t('missions.save_failed'),
        error.message || t('missions.check_backend'),
      );
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
      <Text style={styles.label}>{t('missions.title_label')}</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={text => setForm({ ...form, title: text })}
      />

      <Text style={styles.label}>{t('common.description')}</Text>
      <TextInput
        style={styles.input}
        value={form.description}
        onChangeText={text => setForm({ ...form, description: text })}
        multiline
      />

      <Text style={styles.label}>{t('missions.status')}</Text>
      <View style={styles.row}>
        {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.statusBtn, form.status === s && styles.statusBtnActive]}
            onPress={() => setForm({ ...form, status: s })}
          >
            <Text
              style={[
                styles.statusText,
                form.status === s && styles.statusTextActive,
              ]}
            >
              {translateMissionStatus(t, s)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('locations.client_optional')}</Text>
      <OptionalClientPicker
        value={form.clientId}
        onChange={(clientId: number | null) => setForm({ ...form, clientId })}
      />

      <Text style={styles.label}>{t('locations.provider_optional')}</Text>
      <OptionalProviderPicker
        value={form.providerId}
        onChange={(providerId: number | null) =>
          setForm({ ...form, providerId })
        }
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>{t('transaction.save_changes')}</Text>
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
  },
  statusBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  statusTextActive: { color: '#fff' },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
