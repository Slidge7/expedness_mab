import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchItems } from '../../../store/itemSlice';
import { theme } from '../../../theme';

export const ItemListScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(state => state.items);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: item.type === 'INCOME' ? '#D1FAE5' : '#FEE2E2' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: item.type === 'INCOME' ? '#065F46' : '#991B1B' },
            ]}
          >
            {item.type}
          </Text>
        </View>
      </View>

      <Text style={styles.details}>
        {item.category} • {item.unit}
      </Text>
      <Text style={styles.price}>${item.unitPrice?.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* FAB to Add Item */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateItem')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  details: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { color: '#FFF', fontSize: 24, fontWeight: '600' },
});
