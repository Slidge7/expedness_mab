import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../../store/hooks';
import { createItem } from '../../../store/itemSlice';
import { fetchProviders } from '../../../store/providerSlice';
import { theme } from '../../../theme';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { CategoryPicker } from '../../transactions/components/CategoryPicker';
import { MultiProviderPicker } from '../../transactions/components/MultiProviderPicker';
import { useTranslation } from 'react-i18next';
import { translateTransactionType } from '../../../i18n/helpers';

export const CreateItemScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<any>(null);
  const [providerIds, setProviderIds] = useState<number[]>([]);
  const [providers, setProviders] = useState<{ id: number; label: string }[]>([]);

  React.useEffect(() => {
    dispatch(fetchProviders()).then(action => {
      if (fetchProviders.fulfilled.match(action)) {
        setProviders(
          action.payload
            .filter(p => p.id != null)
            .map(p => ({ id: p.id!, label: p.name })),
        );
      }
    });
  }, [dispatch]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    unitPrice: '',
    category: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    unit: 'pcs',
    active: true,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    unitPrice?: string;
  }>({});

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

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await dispatch(
        createItem({
          data: {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            unitPrice: parseFloat(form.unitPrice),
            category: form.category.trim() || undefined,
            type: form.type,
            unit: form.unit.trim() || undefined,
            active: form.active,
            providerIds,
          },
          imageFile: tempImageFile ?? undefined,
        }),
      ).unwrap();

      Alert.alert(t('common.success'), t('items.item_created'), [
        { text: t('common.ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('[CreateItemScreen] Error:', error);
      Alert.alert(t('common.error'), error?.message || t('items.create_failed'));
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setTempImageFile(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('items.create_item')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('items.create_subtitle')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('items.item_image')}</Text>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={removeImage}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>📷</Text>
              <Text style={styles.imagePlaceholderText}>{t('items.no_image')}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.changeImageBtn}
            onPress={handleImagePress}
          >
            <Text style={styles.changeImageText}>
              {imageUri ? t('items.change_image') : t('items.add_image')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('items.basic_info')}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('items.item_name')} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={text => {
              setForm({ ...form, name: text });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder={t('items.name_placeholder')}
            placeholderTextColor="#94A3B8"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('common.description')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={text => setForm({ ...form, description: text })}
            placeholder={t('items.description_placeholder')}
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('items.unit_price')} <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.priceInput, errors.unitPrice && styles.inputError]}
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('items.transaction_type')}</Text>
        <View style={styles.typeContainer}>
          {(['EXPENSE', 'INCOME'] as const).map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setForm({ ...form, type })}
              style={[
                styles.typeBtn,
                form.type === type && styles.typeBtnActive,
                form.type === type && type === 'INCOME' && styles.typeBtnActiveIncome,
                form.type === type &&
                  type === 'EXPENSE' &&
                  styles.typeBtnActiveExpense,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.typeIcon, form.type === type && { color: '#FFF' }]}
              >
                {type === 'INCOME' ? '↑' : '↓'}
              </Text>
              <Text
                style={[
                  styles.typeText,
                  form.type === type && { color: '#FFF', fontWeight: '700' },
                ]}
              >
                {translateTransactionType(t, type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('items.additional_details')}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('transaction.category')}</Text>
          <CategoryPicker
            value={form.category}
            onChange={name => setForm({ ...form, category: name })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('items.providers_optional')}</Text>
          <MultiProviderPicker
            value={providerIds}
            onChange={setProviderIds}
            items={providers}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('items.unit')}</Text>
          <TextInput
            style={styles.input}
            value={form.unit}
            onChangeText={text => setForm({ ...form, unit: text })}
            placeholder={t('items.unit_placeholder')}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.label}>{t('items.active_status')}</Text>
            <Text style={styles.switchSubtext}>
              {t('items.active_hint')}
            </Text>
          </View>
          <Switch
            value={form.active}
            onValueChange={v => setForm({ ...form, active: v })}
            trackColor={{ false: '#CBD5E1', true: theme.colors.primary }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
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
              <Text style={styles.saveText}>{t('items.creating')}</Text>
            </View>
          ) : (
            <Text style={styles.saveText}>{t('items.create_item_btn')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    gap: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  imagePlaceholderIcon: {
    fontSize: 32,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  changeImageBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeImageText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 80,
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
    paddingLeft: 12,
    fontSize: 15,
    color: '#64748B',
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  typeBtnActive: {
    borderColor: 'transparent',
  },
  typeBtnActiveIncome: {
    backgroundColor: '#10B981',
  },
  typeBtnActiveExpense: {
    backgroundColor: '#EF4444',
  },
  typeIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
