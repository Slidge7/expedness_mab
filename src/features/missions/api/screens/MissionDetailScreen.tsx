import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { missionService, MissionDTO } from '../missionService';
import { theme } from '../../../../theme';

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

export const MissionDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const missionId = route.params?.missionId as number;
  const [mission, setMission] = useState<MissionDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setMission(await missionService.getById(missionId));
    } catch {
      Alert.alert('Error', 'Failed to load mission.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [missionId]);

  const handleDelete = () => {
    Alert.alert('Delete Mission', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await missionService.delete(missionId);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete mission.');
          }
        },
      },
    ]);
  };

  if (loading) {
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
      <Text style={styles.title}>{mission?.title}</Text>
      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{mission?.status}</Text>
      </View>

      <View style={styles.section}>
        <InfoRow label="Description" value={mission?.description} />
        <InfoRow label="Client" value={mission?.clientName} />
        <InfoRow label="Provider" value={mission?.providerName} />
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditMission', { missionId })}
      >
        <Text style={styles.editText}>Edit Mission</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Mission</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  title: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  statusText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 13, color: '#94A3B8', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#1E293B', fontWeight: '500' },
  editBtn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  editText: { color: '#fff', fontWeight: '700' },
  deleteBtn: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteText: { color: '#DC2626', fontWeight: '600' },
});
