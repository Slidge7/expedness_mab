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
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { categoryService } from '../api/categoryService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

export const CreateCategoryScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    categoryType: '',
    description: '',
    code: '',
    parents: '',
    tags: '',
  });

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
        setImageUri(result.assets[0].uri!);
        setTempImageFile(result.assets[0]);
      }
    } catch {
      Alert.alert(t('common.error'), t('items.pick_image_failed'));
    }
  };

  const handleImagePress = () => {
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

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('common.error'), t('categories.name_required'));
      return;
    }

    setLoading(true);
    try {
      await categoryService.create(
        {
          name: form.name.trim(),
          categoryType: form.categoryType.trim() || undefined,
          description: form.description.trim() || undefined,
          code: form.code.trim() || undefined,
          parents: form.parents.trim() || undefined,
          tags: form.tags.trim() || undefined,
        },
        tempImageFile ?? undefined,
      );
      Alert.alert(t('common.success'), t('categories.create_success'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.response?.data?.message ||
          error.message ||
          t('categories.create_failed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.sectionTitle}>{t('categories.image')}</Text>
      <TouchableOpacity onPress={handleImagePress} activeOpacity={0.8}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>📷</Text>
            <Text style={styles.imagePlaceholderText}>{t('items.add_image')}</Text>
          </View>
        )}
      </TouchableOpacity>
      {imageUri && (
        <TouchableOpacity
          style={styles.removeImageBtn}
          onPress={() => {
            setImageUri(null);
            setTempImageFile(null);
          }}
        >
          <Text style={styles.removeImageText}>{t('items.remove_image')}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>{t('categories.name')} *</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={text => setForm({ ...form, name: text })}
        placeholder={t('categories.name_placeholder')}
      />

      <Text style={styles.label}>{t('categories.category_type')}</Text>
      <TextInput
        style={styles.input}
        value={form.categoryType}
        onChangeText={text => setForm({ ...form, categoryType: text })}
        placeholder={t('categories.category_type_placeholder')}
        autoCapitalize="none"
      />

      <Text style={styles.label}>{t('common.description')}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={form.description}
        onChangeText={text => setForm({ ...form, description: text })}
        placeholder={t('categories.description_placeholder')}
        multiline
      />

      <Text style={styles.label}>{t('categories.code')}</Text>
      <TextInput
        style={styles.input}
        value={form.code}
        onChangeText={text => setForm({ ...form, code: text })}
        placeholder={t('categories.code_placeholder')}
        autoCapitalize="none"
      />

      <Text style={styles.label}>{t('categories.parents')}</Text>
      <TextInput
        style={styles.input}
        value={form.parents}
        onChangeText={text => setForm({ ...form, parents: text })}
        placeholder={t('categories.parents_placeholder')}
      />
      <Text style={styles.hint}>{t('categories.comma_separated_hint')}</Text>

      <Text style={styles.label}>{t('categories.tags')}</Text>
      <TextInput
        style={styles.input}
        value={form.tags}
        onChangeText={text => setForm({ ...form, tags: text })}
        placeholder={t('categories.tags_placeholder')}
      />
      <Text style={styles.hint}>{t('categories.comma_separated_hint')}</Text>

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

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  imagePlaceholderIcon: { fontSize: 32 },
  imagePlaceholderText: { fontSize: 13, color: '#94A3B8', marginTop: 6 },
  removeImageBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  removeImageText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
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
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: '#94A3B8', marginTop: 6 },
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
