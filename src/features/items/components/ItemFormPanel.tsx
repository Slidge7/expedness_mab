import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAppDispatch } from '../../../store/hooks';
import {
  createItem,
  updateItem,
  uploadItemImage,
  deleteItemImage,
} from '../../../store/itemSlice';
import { theme } from '../../../theme';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { CategoryPicker } from '../../transactions/components/CategoryPicker';
import { ItemDTO, TransactionType } from '../api/itemService';
import { useTranslation } from 'react-i18next';
import { translateTransactionType } from '../../../i18n/helpers';

interface ItemFormPanelProps {
  itemType: TransactionType;
  editItem?: ItemDTO | null;
  onSaved: () => void;
  onCancel: () => void;
}

export const ItemFormPanel: React.FC<ItemFormPanelProps> = ({
  itemType,
  editItem,
  onSaved,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isEdit = !!editItem?.id;
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<any>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    unitPrice: '',
    category: '',
    unit: 'pcs',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    unitPrice?: string;
  }>({});

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        description: editItem.description || '',
        unitPrice: editItem.unitPrice.toString(),
        category: editItem.category || '',
        unit: editItem.unit || 'pcs',
      });
      if (editItem.imageMedium) {
        setImageUri(`data:image/jpeg;base64,${editItem.imageMedium}`);
        setHasExistingImage(true);
      } else {
        setImageUri(null);
        setHasExistingImage(false);
      }
      setTempImageFile(null);
      setImageChanged(false);
    } else {
      setForm({
        name: '',
        description: '',
        unitPrice: '',
        category: '',
        unit: 'pcs',
      });
      setImageUri(null);
      setTempImageFile(null);
      setHasExistingImage(false);
      setImageChanged(false);
    }
    setErrors({});
  }, [editItem, itemType]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) {
      newErrors.name = t('items.name_required');
    }
    if (!form.unitPrice || isNaN(parseFloat(form.unitPrice))) {
      newErrors.unitPrice = t('items.price_required');
    } else if (parseFloat(form.unitPrice) < 0) {
      newErrors.unitPrice = t('items.price_positive');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    } catch (error) {
      console.error('Error picking image:', error);
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
    if (isEdit && hasExistingImage && !imageChanged && editItem?.id) {
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
        await dispatch(deleteItemImage(editItem.id)).unwrap();
        setImageUri(null);
        setHasExistingImage(false);
      } catch {
        Alert.alert(t('common.error'), t('items.remove_image_failed'));
      }
    } else {
      setImageUri(null);
      setTempImageFile(null);
      setImageChanged(false);
      if (isEdit && editItem?.imageMedium) {
        setImageUri(`data:image/jpeg;base64,${editItem.imageMedium}`);
        setHasExistingImage(true);
      }
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      unitPrice: parseFloat(form.unitPrice),
      category: form.category.trim() || undefined,
      type: itemType,
      unit: form.unit.trim() || undefined,
      active: editItem?.active ?? true,
      providerIds: editItem?.providerIds,
    };

    setLoading(true);
    try {
      if (isEdit && editItem?.id) {
        await dispatch(
          updateItem({
            id: editItem.id,
            data: payload,
          }),
        ).unwrap();

        if (imageChanged && tempImageFile) {
          await dispatch(
            uploadItemImage({ id: editItem.id, imageFile: tempImageFile }),
          ).unwrap();
        }
      } else {
        await dispatch(
          createItem({
            data: payload,
            imageFile: tempImageFile ?? undefined,
          }),
        ).unwrap();
      }

      onSaved();
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error?.message ||
          (isEdit ? t('items.update_failed') : t('items.create_failed')),
      );
    } finally {
      setLoading(false);
    }
  };

  const typeColor = itemType === 'INCOME' ? '#10B981' : '#EF4444';

  const typeLabel = translateTransactionType(t, itemType);

  return (
    <View style={styles.container}>
      <View style={styles.typeRow}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeBadgeText}>
            {itemType === 'INCOME' ? `↑ ${typeLabel}` : `↓ ${typeLabel}`}
          </Text>
        </View>
        <Text style={styles.typeHint}>
          {isEdit ? t('items.item_type') : t('items.set_from_filter')}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.section1}>
          <View style={styles.imageArea}>
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
                onPress={handleRemoveImage}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.titlePriceColumn}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('items.title')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={form.name}
                onChangeText={text => {
                  setForm({ ...form, name: text });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder={t('items.item_name')}
                placeholderTextColor="#94A3B8"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('items.price')} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[
                    styles.priceInput,
                    errors.unitPrice && styles.inputError,
                  ]}
                  value={form.unitPrice}
                  onChangeText={text => {
                    setForm({ ...form, unitPrice: text });
                    if (errors.unitPrice)
                      setErrors({ ...errors, unitPrice: undefined });
                  }}
                  keyboardType="decimal-pad"
                  placeholder={t('items.price_placeholder')}
                  placeholderTextColor="#94A3B8"
                />
              </View>
              {errors.unitPrice && (
                <Text style={styles.errorText}>{errors.unitPrice}</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('transaction.category_optional')}</Text>
          <CategoryPicker
            value={form.category}
            onChange={name => setForm({ ...form, category: name })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('common.description')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={text => setForm({ ...form, description: text })}
            placeholder={t('items.brief_description')}
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={[styles.inputGroup, styles.inputGroupLast]}>
          <Text style={styles.label}>{t('items.unit')}</Text>
          <TextInput
            style={styles.input}
            value={form.unit}
            onChangeText={text => setForm({ ...form, unit: text })}
            placeholder={t('items.unit_placeholder')}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelText}>{t('common.cancel')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingButtonContent}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.saveText}>
                {isEdit ? t('transaction.saving') : t('items.creating')}
              </Text>
            </View>
          ) : (
            <Text style={styles.saveText}>
              {isEdit ? t('transaction.save_changes') : t('items.create_item_btn')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  typeHint: {
    fontSize: 12,
    color: '#94A3B8',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section1: {
    flexDirection: 'row',
    gap: 12,
  },
  imageArea: {
    width: 100,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  imagePlaceholderIcon: {
    fontSize: 24,
  },
  imagePlaceholderText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  titlePriceColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputGroupLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  currencySymbol: {
    paddingLeft: 10,
    fontSize: 15,
    color: '#64748B',
  },
  priceInput: {
    flex: 1,
    padding: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
