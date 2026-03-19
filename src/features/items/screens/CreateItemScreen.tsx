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
import { theme } from '../../../theme';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export const CreateItemScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<any>(null);

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
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }
      if (result.assets?.[0]) {
        setImageUri(result.assets[0].uri!);
        setTempImageFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleImagePress = () => {
    if (Platform.OS === 'web') {
      const choice = window.confirm(
        'Click OK to use Camera, Cancel to pick from Gallery',
      );
      pickImage(choice ? 'camera' : 'library');
    } else {
      Alert.alert('Select Image', 'Choose an option', [
        { text: 'Camera', onPress: () => pickImage('camera') },
        { text: 'Gallery', onPress: () => pickImage('library') },
        { text: 'Cancel', style: 'cancel' },
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
          },
          imageFile: tempImageFile ?? undefined,
        }),
      ).unwrap();

      Alert.alert('Success', 'Item created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('[CreateItemScreen] Error:', error);
      Alert.alert('Error', error?.message || 'Failed to create item');
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
        <Text style={styles.headerTitle}>Create New Item</Text>
        <Text style={styles.headerSubtitle}>
          Add a new item to your inventory
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item Image</Text>
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
              <Text style={styles.imagePlaceholderText}>No image</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.changeImageBtn}
            onPress={handleImagePress}
          >
            <Text style={styles.changeImageText}>
              {imageUri ? '📸 Change Image' : '📸 Add Image'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingButtonContent}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.saveText}>Creating...</Text>
            </View>
          ) : (
            <Text style={styles.saveText}>Create Item</Text>
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
