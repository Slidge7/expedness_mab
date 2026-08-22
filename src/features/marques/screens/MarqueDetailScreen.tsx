import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { marqueService, MarqueDTO } from '../api/marqueService';
import { itemService, ItemDTO } from '../../items/api/itemService';
import { getItemImageSmallUri } from '../../items/utils/itemImageUtils';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

const formatMetadata = (metadata?: string) => {
  if (!metadata) return null;
  try {
    return JSON.stringify(JSON.parse(metadata), null, 2);
  } catch {
    return metadata;
  }
};

export const MarqueDetailScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const marqueId = route.params?.marqueId as number;
  const isFocused = useIsFocused();

  const [marque, setMarque] = useState<MarqueDTO | null>(null);
  const [linkedItems, setLinkedItems] = useState<ItemDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [marqueData, itemsData] = await Promise.all([
        marqueService.getById(marqueId),
        itemService.getByMarque(marqueId),
      ]);
      setMarque(marqueData);
      setLinkedItems(itemsData);
    } catch {
      Alert.alert(t('common.error'), t('marques.load_details_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [marqueId, isFocused]);

  const handleDelete = () => {
    Alert.alert(
      t('common.delete'),
      t('marques.delete_confirm', { title: marque?.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await marqueService.delete(marqueId);
              navigation.goBack();
            } catch {
              Alert.alert(t('common.error'), t('marques.delete_failed'));
            }
          },
        },
      ],
    );
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

  const metadataDisplay = formatMetadata(marque?.metadata);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {marque?.imageMedium ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${marque.imageMedium}` }}
          style={styles.heroImage}
        />
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]}>
          <Text style={styles.heroLetter}>
            {marque?.title?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <Text style={styles.title}>{marque?.title}</Text>
      {marque?.type ? <Text style={styles.typeBadge}>{marque.type}</Text> : null}
      {marque?.description ? (
        <Text style={styles.description}>{marque.description}</Text>
      ) : null}

      {metadataDisplay ? (
        <View style={styles.metadataBox}>
          <Text style={styles.metadataLabel}>{t('marques.metadata')}</Text>
          <Text style={styles.metadataText}>{metadataDisplay}</Text>
        </View>
      ) : null}

      {marque?.createdBy ? (
        <Text style={styles.meta}>
          {t('items.created_by')}: {marque.createdBy}
        </Text>
      ) : null}

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditMarque', { marqueId })}
      >
        <Text style={styles.editText}>{t('common.edit')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>{t('common.delete')}</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t('marques.linked_items')} ({linkedItems.length})
        </Text>
      </View>

      {linkedItems.length === 0 ? (
        <Text style={styles.empty}>{t('marques.no_linked_items')}</Text>
      ) : (
        linkedItems.map(item => {
          const imageUri = getItemImageSmallUri(item.imageSmall);
          return (
          <TouchableOpacity
            key={item.id}
            style={styles.itemCard}
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
          >
            <View style={styles.itemRow}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.itemThumb} />
              ) : (
                <View style={[styles.itemThumb, styles.itemThumbPlaceholder]}>
                  <Text style={styles.itemThumbLetter}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.unitPrice?.toFixed(2)}</Text>
                {item.tags && item.tags.length > 0 ? (
                  <Text style={styles.itemTags}>{item.tags.join(', ')}</Text>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  heroPlaceholder: {
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLetter: { fontSize: 48, fontWeight: '700', color: '#64748B' },
  title: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 13,
    color: '#475569',
    overflow: 'hidden',
  },
  description: { fontSize: 14, color: '#475569', marginTop: 10 },
  metadataBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  metadataLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 13,
    color: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  meta: { fontSize: 13, color: '#94A3B8', marginTop: 12 },
  editBtn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  editText: { color: '#fff', fontWeight: '700' },
  deleteBtn: { padding: 14, alignItems: 'center', marginTop: 4 },
  deleteText: { color: '#DC2626', fontWeight: '600' },
  sectionHeader: { marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
  empty: { color: '#94A3B8', textAlign: 'center', paddingVertical: 20 },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  itemThumbPlaceholder: {
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemThumbLetter: { fontSize: 18, fontWeight: '700', color: '#64748B' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  itemPrice: { fontSize: 14, color: theme.colors.primary, marginTop: 2 },
  itemTags: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
});
