import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchMissions } from '../../../../store/missionSlice';
import { theme } from '../../../../theme';

export const MissionListScreen = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(state => state.missions);

  useEffect(() => {
    dispatch(fetchMissions());
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id?.toString()!}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    item.status === 'COMPLETED' ? '#D1FAE5' : '#FEF3C7',
                },
              ]}
            >
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontSize: 16, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
});
