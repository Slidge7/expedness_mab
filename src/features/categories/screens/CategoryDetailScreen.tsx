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
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import {
  categoryService,
  CategoryDTO,
} from '../api/categoryService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

export const CategoryDetailScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const DetailRow = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value?.trim()) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const categoryId = route.params?.categoryId as number;
  const isFocused = useIsFocused();

  const [category, setCategory] = useState<CategoryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      setCategory(await categoryService.getById(categoryId));
    } catch {
      Alert.alert(t('common.error'), t('categories.load_details_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [categoryId, isFocused]);

  const pickImage = async (source: 'library' | 'camera') => {
    try {
      const options = {
        mediaType: 'photo' as const,
        quality: 0.8 as const,
        selectionLimit: 1,
        includeBase64: false,
      };
      const result =
        source === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert(
          t('common.error'),
          result.errorMessage || t('items.pick_image_failed'),
        );
        return;
      }
      if (result.assets?.[0]) {
        setUploading(true);
        try {
          const updated = await categoryService.uploadImage(
            categoryId,
            result.assets[0],
          );
          setCategory(updated);
        } catch {
          Alert.alert(t('common.error'), t('items.pick_image_failed'));
        } finally {
          setUploading(false);
        }
      }
    } catch {
      Alert.alert(t('common.error'), t('items.pick_image_failed'));
    }
  };

  const handleReplaceImage = () => {
    if (Platform.OS === 'web') {
      const choice = window.confirm(t('items.camera_gallery_hint'));
      pickImage(choice ? 'camera' : 'library');
    } else {
      Alert.alert(t('items.select_image'), t('items.choose_option'), [
        { text: t('items.camera'), onPress: () => pickImage('camera') },
        { text: t('items.gallery'), onPress: () => pickImage('library') },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      t('items.remove_image'),
      t('items.remove_image_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('items.remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await categoryService.deleteImage(categoryId);
              setCategory(updated);
            } catch {
              Alert.alert(t('common.error'), t('items.remove_image_failed'));
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.delete'),
      t('categories.delete_confirm', { name: category?.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryService.delete(categoryId);
              navigation.goBack();
            } catch {
              Alert.alert(t('common.error'), t('categories.delete_failed'));
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

  const hasImage = !!category?.imageMedium;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {hasImage ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${category!.imageMedium}` }}
          style={styles.heroImage}
        />
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]}>
          <Text style={styles.heroLetter}>
            {category?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.imageActions}>
        <TouchableOpacity
          style={styles.imageActionBtn}
          onPress={handleReplaceImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={theme.colors.primary} size="small" />
          ) : (
            <Text style={styles.imageActionText}>
              {hasImage ? t('items.change_image') : t('items.add_image')}
            </Text>
          )}
        </TouchableOpacity>
        {hasImage && (
          <TouchableOpacity style={styles.imageActionBtn} onPress={handleRemoveImage}>
            <Text style={styles.removeImageText}>{t('items.remove_image')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>{category?.name}</Text>
      {category?.categoryType ? (
        <Text style={styles.typeBadge}>{category.categoryType}</Text>
      ) : null}

      <View style={styles.detailsBox}>
        <DetailRow label={t('common.description')} value={category?.description} />
        <DetailRow label={t('categories.code')} value={category?.code} />
        <DetailRow label={t('categories.parents')} value={category?.parents} />
        <DetailRow label={t('categories.tags')} value={category?.tags} />
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditCategory', { categoryId })}
      >
        <Text style={styles.editText}>{t('common.edit')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>{t('common.delete')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroPlaceholder: {
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLetter: { fontSize: 48, fontWeight: '700', color: theme.colors.textSecondary },
  imageActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  imageActionBtn: { paddingVertical: 4 },
  imageActionText: { color: theme.colors.primary, fontWeight: '700' },
  removeImageText: { color: theme.colors.danger, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 13,
    color: theme.colors.textSecondary,
    overflow: 'hidden',
  },
  detailsBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  detailRow: { marginBottom: 12 },
  detailLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: { fontSize: 15, color: theme.colors.text },
  editBtn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  editText: { color: '#fff', fontWeight: '700' },
  deleteBtn: { padding: 14, alignItems: 'center', marginTop: 4 },
  deleteText: { color: theme.colors.danger, fontWeight: '600' },
});
