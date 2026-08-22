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
  Image,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { marqueService } from '../api/marqueService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';

export const EditMarqueScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const marqueId = route.params?.marqueId as number;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<any>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [metadataError, setMetadataError] = useState<string | undefined>();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    metadata: '',
  });

  useEffect(() => {
    marqueService
      .getById(marqueId)
      .then(marque => {
        setForm({
          title: marque.title,
          description: marque.description || '',
          type: marque.type || '',
          metadata: marque.metadata || '',
        });
        if (marque.imageMedium) {
          setImageUri(`data:image/jpeg;base64,${marque.imageMedium}`);
          setHasExistingImage(true);
        }
      })
      .catch(() => {
        Alert.alert(t('common.error'), t('marques.load_error'));
        navigation.goBack();
      })
      .finally(() => setFetching(false));
  }, [marqueId, navigation, t]);

  const validateMetadata = (text: string) => {
    if (!text.trim()) {
      setMetadataError(undefined);
      return true;
    }
    try {
      JSON.parse(text);
      setMetadataError(undefined);
      return true;
    } catch {
      setMetadataError(t('marques.metadata_invalid'));
      return false;
    }
  };

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
        Alert.alert(t('common.error'), result.errorMessage || t('items.pick_image_failed'));
        return;
      }
      if (result.assets?.[0]) {
        setImageUri(result.assets[0].uri!);
        setTempImageFile(result.assets[0]);
        setImageChanged(true);
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

  const handleRemoveImage = async () => {
    if (hasExistingImage && !imageChanged) {
      const confirmed =
        Platform.OS === 'web'
          ? window.confirm(t('items.remove_image_confirm'))
          : await new Promise<boolean>(resolve => {
              Alert.alert(
                t('items.remove_image'),
                t('items.remove_image_confirm'),
                [
                  { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
                  {
                    text: t('items.remove'),
                    style: 'destructive',
                    onPress: () => resolve(true),
                  },
                ],
              );
            });

      if (!confirmed) return;

      try {
        await marqueService.deleteImage(marqueId);
        setImageUri(null);
        setHasExistingImage(false);
      } catch {
        Alert.alert(t('common.error'), t('items.remove_image_failed'));
      }
    } else {
      setImageUri(null);
      setTempImageFile(null);
      setImageChanged(false);
      if (hasExistingImage) {
        marqueService.getById(marqueId).then(m => {
          if (m.imageMedium) {
            setImageUri(`data:image/jpeg;base64,${m.imageMedium}`);
          }
        });
      }
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert(t('common.error'), t('marques.title_required'));
      return;
    }
    if (!validateMetadata(form.metadata)) return;

    setLoading(true);
    try {
      await marqueService.update(marqueId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        type: form.type.trim() || undefined,
        metadata: form.metadata.trim() || undefined,
      });

      if (imageChanged && tempImageFile) {
        await marqueService.uploadImage(marqueId, tempImageFile);
      }

      Alert.alert(t('common.success'), t('marques.update_success'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || error.message || t('marques.update_failed'),
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
      <Text style={styles.sectionTitle}>{t('marques.image')}</Text>
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
        <TouchableOpacity style={styles.removeImageBtn} onPress={handleRemoveImage}>
          <Text style={styles.removeImageText}>{t('items.remove_image')}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.changeImageBtn} onPress={handleImagePress}>
        <Text style={styles.changeImageText}>
          {imageUri ? t('items.change_image') : t('items.add_image')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>{t('marques.title')} *</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={text => setForm({ ...form, title: text })}
      />

      <Text style={styles.label}>{t('marques.type')}</Text>
      <TextInput
        style={styles.input}
        value={form.type}
        onChangeText={text => setForm({ ...form, type: text })}
      />

      <Text style={styles.label}>{t('common.description')}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={form.description}
        onChangeText={text => setForm({ ...form, description: text })}
        multiline
      />

      <Text style={styles.label}>{t('marques.metadata')}</Text>
      <TextInput
        style={[styles.input, styles.textArea, metadataError && styles.inputError]}
        value={form.metadata}
        onChangeText={text => {
          setForm({ ...form, metadata: text });
          if (metadataError) validateMetadata(text);
        }}
        onBlur={() => validateMetadata(form.metadata)}
        multiline
        autoCapitalize="none"
      />
      {metadataError ? (
        <Text style={styles.errorText}>{metadataError}</Text>
      ) : (
        <Text style={styles.hint}>{t('marques.metadata_hint')}</Text>
      )}

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
  removeImageBtn: { marginBottom: 8, alignSelf: 'flex-start' },
  removeImageText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  changeImageBtn: { marginBottom: 16 },
  changeImageText: { color: theme.colors.primary, fontWeight: '700' },
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
  inputError: { borderColor: '#EF4444' },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: '#94A3B8', marginTop: 6 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6 },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
