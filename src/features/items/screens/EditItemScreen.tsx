import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchItemById,
  updateItem,
  uploadItemImage,
  deleteItemImage,
} from '../../../store/itemSlice';
import { theme } from '../../../theme';
import { launchImageLibrary } from 'react-native-image-picker';

export const EditItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();

  const { selectedItem, loading } = useAppSelector(state => state.items);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<any>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

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

  const itemId = route.params?.itemId;

  useEffect(() => {
    if (itemId) {
      dispatch(fetchItemById(itemId));
    }
  }, [itemId, dispatch]);

  useEffect(() => {
    if (selectedItem) {
      setForm({
        name: selectedItem.name,
        description: selectedItem.description || '',
        unitPrice: selectedItem.unitPrice.toString(),
        category: selectedItem.category || '',
        type: selectedItem.type,
        unit: selectedItem.unit || 'pcs',
        active: selectedItem.active,
      });
      if (selectedItem.imageMedium) {
        setImageUri(`data:image/jpeg;base64,${selectedItem.imageMedium}`);
        setHasExistingImage(true);
      } else {
        setImageUri(null);
        setHasExistingImage(false);
      }
    }
  }, [selectedItem]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!form.unitPrice || isNaN(parseFloat(form.unitPrice))) {
      newErrors.unitPrice = 'Valid price is required';
    } else if (parseFloat(form.unitPrice) < 0) {
      newErrors.unitPrice = 'Price must be positive';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: false,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }
      if (result.assets?.[0]) {
        setImageUri(result.assets[0].uri!);
        setTempImageFile(result.assets[0]);
        setImageChanged(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = async () => {
    if (hasExistingImage && !imageChanged) {
      Alert.alert(
        'Remove Image',
        'Are you sure you want to remove this image?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              setDeletingImage(true);
              try {
                await dispatch(deleteItemImage(itemId)).unwrap();
                setImageUri(null);
                setHasExistingImage(false);
                Alert.alert('Success', 'Image removed');
              } catch (error) {
                Alert.alert('Error', 'Failed to remove image');
              } finally {
                setDeletingImage(false);
              }
            },
          },
        ],
      );
    } else {
      setImageUri(
        hasExistingImage && selectedItem?.imageMedium
          ? `data:image/jpeg;base64,${selectedItem.imageMedium}`
          : null,
      );
      setTempImageFile(null);
      setImageChanged(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await dispatch(
        updateItem({
          id: itemId,
          data: {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            unitPrice: parseFloat(form.unitPrice),
            category: form.category.trim() || undefined,
            type: form.type,
            unit: form.unit.trim() || undefined,
            active: form.active,
          },
        }),
      ).unwrap();

      if (imageChanged && tempImageFile) {
        setUploadingImage(true);
        await dispatch(
          uploadItemImage({ id: itemId, imageFile: tempImageFile }),
        ).unwrap();
      }

      Alert.alert('Success', 'Item updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error updating item:', error);
      Alert.alert('Error', error?.message || 'Failed to update item');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  if (loading || !selectedItem) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Item</Text>
        <Text style={styles.headerSubtitle}>
          Update item information and details
        </Text>
      </View>

      {/* Image Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item Image</Text>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={handleRemoveImage}
                disabled={deletingImage}
              >
                {deletingImage ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.removeImageText}>✕</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>📷</Text>
              <Text style={styles.imagePlaceholderText}>No image</Text>
            </View>
          )}
          <TouchableOpacity style={styles.changeImageBtn} onPress={pickImage}>
            <Text style={styles.changeImageText}>
              {imageUri ? '📸 Change Image' : '📸 Add Image'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Item Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={t => {
              setForm({ ...form, name: t });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder="e.g. Laptop, Coffee, Consulting"
            placeholderTextColor="#94A3B8"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={t => setForm({ ...form, description: t })}
            placeholder="Brief description of the item..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Unit Price <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.priceInput, errors.unitPrice && styles.inputError]}
              value={form.unitPrice}
              onChangeText={t => {
                setForm({ ...form, unitPrice: t });
                if (errors.unitPrice)
                  setErrors({ ...errors, unitPrice: undefined });
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />
          </View>
          {errors.unitPrice && (
            <Text style={styles.errorText}>{errors.unitPrice}</Text>
          )}
        </View>
      </View>

      {/* Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Type</Text>
        <View style={styles.typeContainer}>
          {(['EXPENSE', 'INCOME'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setForm({ ...form, type: t })}
              style={[
                styles.typeBtn,
                form.type === t && styles.typeBtnActive,
                form.type === t && t === 'INCOME' && styles.typeBtnActiveIncome,
                form.type === t &&
                  t === 'EXPENSE' &&
                  styles.typeBtnActiveExpense,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.typeIcon, form.type === t && { color: '#FFF' }]}
              >
                {t === 'INCOME' ? '↑' : '↓'}
              </Text>
              <Text
                style={[
                  styles.typeText,
                  form.type === t && { color: '#FFF', fontWeight: '700' },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Additional Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={form.category}
            onChangeText={t => setForm({ ...form, category: t })}
            placeholder="e.g. Electronics, Food, Service"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Unit</Text>
          <TextInput
            style={styles.input}
            value={form.unit}
            onChangeText={t => setForm({ ...form, unit: t })}
            placeholder="e.g. kg, hr, box, pcs"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.label}>Active Status</Text>
            <Text style={styles.switchSubtext}>
              Item is available for transactions
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

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving || uploadingImage ? (
            <View style={styles.loadingButtonContent}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.saveText}>
                {uploadingImage ? 'Uploading...' : 'Saving...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  imageContainer: {
    gap: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    height: 200,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderIcon: {
    fontSize: 40,
  },
  imagePlaceholderText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  changeImageBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  changeImageText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  currencySymbol: {
    paddingLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
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
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
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
    fontSize: 18,
    color: '#94A3B8',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
