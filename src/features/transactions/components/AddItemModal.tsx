import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { createItem } from '../../../store/itemSlice';
import { TransactionItemDTO } from '../api/transactionService';
import { ItemDTO } from '../../items/api/itemService';
import { theme } from '../../../theme';
import { QuantityPicker } from './QuantityPicker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddMultiple: (items: TransactionItemDTO[]) => void;
  transactionType: 'INCOME' | 'EXPENSE';
}

export const AddItemModal = ({
  visible,
  onClose,
  onAddMultiple,
  transactionType,
}: Props) => {
  const dispatch = useAppDispatch();
  const inventoryItems = useAppSelector(state => state.items.items);

  // Flow State
  const [localCart, setLocalCart] = useState<
    Record<string, TransactionItemDTO>
  >({});
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');

  // Detail Mode State
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(
    undefined,
  );
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');

  // Create Mode State
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<any>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    unitPrice: '',
    category: '',
    type: transactionType as 'INCOME' | 'EXPENSE',
    unit: 'pcs',
    active: true,
  });
  const [createErrors, setCreateErrors] = useState<{
    name?: string;
    unitPrice?: string;
  }>({});

  useEffect(() => {
    if (visible) {
      setLocalCart({});
      setIsDetailMode(false);
      setIsCreateMode(false);
      setSearchQuery('');
      setSortBy('name');
      resetCreateForm();
    }
  }, [visible]);

  const resetCreateForm = () => {
    setImageUri(null);
    setTempImageFile(null);
    setCreateForm({
      name: '',
      description: '',
      unitPrice: '',
      category: '',
      type: transactionType,
      unit: 'pcs',
      active: true,
    });
    setCreateErrors({});
  };

  // --- Cart & Grid Logic ---

  const handleIncrement = (item: ItemDTO) => {
    setLocalCart(prev => {
      const existing = prev[item.id!];
      if (existing) {
        return {
          ...prev,
          [item.id!]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return {
        ...prev,
        [item.id!]: {
          itemId: item.id,
          category: item.category || item.name || '',
          quantity: 1,
          unitPrice: item.unitPrice || 0,
          reason: item.description || '',
          type: transactionType,
        },
      };
    });
  };

  const handleDecrement = (item: ItemDTO) => {
    setLocalCart(prev => {
      const existing = prev[item.id!];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[item.id!];
        return next;
      }
      return {
        ...prev,
        [item.id!]: { ...existing, quantity: existing.quantity - 1 },
      };
    });
  };

  const handleConfirmCart = () => {
    const itemsToReturn = Object.values(localCart);
    if (itemsToReturn.length > 0) {
      onAddMultiple(itemsToReturn);
    }
    onClose();
  };

  // --- Detail Mode Logic ---

  const openDetails = (item: ItemDTO) => {
    setSelectedItemId(item.id);
    setCategory(item.category || item.name || '');
    setUnitPrice(item.unitPrice?.toString() || '');
    setReason(item.description || item.reason || '');
    setQuantity(localCart[item.id!]?.quantity || 1);
    setIsDetailMode(true);
  };

  const handleItemSelect = (rawId: number | string | undefined) => {
    const id = Number(rawId);
    setSelectedItemId(id);
    const item = inventoryItems.find(i => i.id === id);
    if (item) {
      setCategory(item.category || item.name || '');
      setUnitPrice(item.unitPrice?.toString() || '');
      setReason(item.description || item.reason || '');
      setQuantity(localCart[id]?.quantity || 1);
    }
  };

  const handleSaveDetail = () => {
    if (!unitPrice || !category) {
      alert('Please fill in Category and Unit Price.');
      return;
    }
    const newItem: TransactionItemDTO = {
      itemId: selectedItemId,
      category,
      quantity,
      unitPrice: parseFloat(unitPrice),
      reason,
      type: transactionType,
    };
    if (selectedItemId) {
      setLocalCart(prev => ({ ...prev, [selectedItemId.toString()]: newItem }));
    }
    setIsDetailMode(false);
  };

  // --- Create Mode Logic ---

  const validateCreateForm = () => {
    const newErrors: typeof createErrors = {};
    if (!createForm.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!createForm.unitPrice || isNaN(parseFloat(createForm.unitPrice))) {
      newErrors.unitPrice = 'Valid price is required';
    } else if (parseFloat(createForm.unitPrice) < 0) {
      newErrors.unitPrice = 'Price must be positive';
    }
    setCreateErrors(newErrors);
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

  const handleSaveCustomItem = async () => {
    if (!validateCreateForm()) return;
    setLoading(true);
    try {
      const newItemResult = await dispatch(
        createItem({
          data: {
            name: createForm.name.trim(),
            description: createForm.description.trim() || undefined,
            unitPrice: parseFloat(createForm.unitPrice),
            category: createForm.category.trim() || undefined,
            type: createForm.type,
            unit: createForm.unit.trim() || undefined,
            active: createForm.active,
          },
          imageFile: tempImageFile ?? undefined,
        }),
      ).unwrap();

      const newItemToCart: TransactionItemDTO = {
        itemId: newItemResult.id,
        category: newItemResult.category || newItemResult.name,
        quantity: 1,
        unitPrice: newItemResult.unitPrice || 0,
        reason: newItemResult.description || '',
        type: transactionType,
      };

      setLocalCart(prev => ({ ...prev, [newItemResult.id!]: newItemToCart }));
      setIsCreateMode(false);
      resetCreateForm();
    } catch (error: any) {
      console.error('[CreateItemModal] Error:', error);
      Alert.alert('Error', error?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---

  const filteredItems = inventoryItems
    .filter(
      i =>
        i.active &&
        (i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.category?.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (a.unitPrice || 0) - (b.unitPrice || 0);
    });

  const totalCartItems = Object.values(localCart).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const lineTotal = quantity * (parseFloat(unitPrice) || 0);

  const renderGridItem = ({ item }: { item: ItemDTO }) => {
    const qty = localCart[item.id!]?.quantity || 0;
    const isSelected = qty > 0;

    return (
      <View style={[styles.gridCard, isSelected && styles.gridCardSelected]}>
        {isSelected && (
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyBadgeText}>{qty}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => openDetails(item)}
        >
          <Text style={styles.detailBtnText}>⚙</Text>
        </TouchableOpacity>

        <View style={styles.gridImageContainer}>
          {item.imageSmall ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.imageSmall}` }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.gridImage, styles.placeholderImage]}>
              <Text style={styles.placeholderTextLarge}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.gridDetails}>
          <Text style={styles.gridName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.gridPrice}>${item.unitPrice?.toFixed(2)}</Text>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => handleDecrement(item)}
          >
            <Text style={styles.controlBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.controlQty}>{qty}</Text>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => handleIncrement(item)}
          >
            <Text style={styles.controlBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        {isCreateMode ? (
          // --- CREATE MODE ---
          <View style={[styles.card, { height: '90%' }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Item</Text>
              <TouchableOpacity
                onPress={() => setIsCreateMode(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.imageContainer}>
                {imageUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => {
                        setImageUri(null);
                        setTempImageFile(null);
                      }}
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

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>
                  ITEM NAME <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, createErrors.name && styles.inputError]}
                  value={createForm.name}
                  onChangeText={t => {
                    setCreateForm({ ...createForm, name: t });
                    if (createErrors.name)
                      setCreateErrors({ ...createErrors, name: undefined });
                  }}
                  placeholder="e.g. Custom Part"
                  placeholderTextColor="#94A3B8"
                />
                {createErrors.name && (
                  <Text style={styles.errorText}>{createErrors.name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>
                  UNIT PRICE <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    createErrors.unitPrice && styles.inputError,
                  ]}
                  value={createForm.unitPrice}
                  onChangeText={t => {
                    setCreateForm({ ...createForm, unitPrice: t });
                    if (createErrors.unitPrice)
                      setCreateErrors({
                        ...createErrors,
                        unitPrice: undefined,
                      });
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                />
                {createErrors.unitPrice && (
                  <Text style={styles.errorText}>{createErrors.unitPrice}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={createForm.description}
                  onChangeText={t =>
                    setCreateForm({ ...createForm, description: t })
                  }
                  placeholder="Brief description..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>CATEGORY (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={createForm.category}
                  onChangeText={t =>
                    setCreateForm({ ...createForm, category: t })
                  }
                  placeholder="e.g. Hardware"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>TRANSACTION TYPE</Text>
                <View style={styles.typeContainer}>
                  {(['EXPENSE', 'INCOME'] as const).map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setCreateForm({ ...createForm, type: t })}
                      style={[
                        styles.typeBtn,
                        createForm.type === t && styles.typeBtnActive,
                        createForm.type === t &&
                          t === 'INCOME' &&
                          styles.typeBtnActiveIncome,
                        createForm.type === t &&
                          t === 'EXPENSE' &&
                          styles.typeBtnActiveExpense,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeText,
                          createForm.type === t && { color: '#FFF' },
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.btnRow}>
              <TouchableOpacity
                onPress={() => setIsCreateMode(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                onPress={handleSaveCustomItem}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveText}>Create & Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : isDetailMode ? (
          // --- DETAIL MODE ---
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Item Details</Text>
              <TouchableOpacity
                onPress={() => setIsDetailMode(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>SELECTED ITEM</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={selectedItemId}
                  onValueChange={handleItemSelect}
                  style={styles.picker}
                >
                  {inventoryItems
                    .filter(i => i.active)
                    .map(i => (
                      <Picker.Item key={i.id} label={i.name} value={i.id} />
                    ))}
                </Picker>
              </View>

              <View style={styles.quantityPriceRow}>
                <View style={styles.quantityBlock}>
                  <Text style={styles.fieldLabel}>QUANTITY</Text>
                  <View style={styles.drumWrapper}>
                    <QuantityPicker
                      value={quantity}
                      onChange={setQuantity}
                      min={1}
                      max={999}
                    />
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.priceBlock}>
                  <Text style={styles.fieldLabel}>UNIT PRICE</Text>
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="numeric"
                    value={unitPrice}
                    onChangeText={setUnitPrice}
                    placeholder="0.00"
                    placeholderTextColor="#CBD5E1"
                  />
                  <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Subtotal</Text>
                    <Text style={styles.subtotalValue}>
                      ${lineTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionLabel}>DETAILS</Text>
              <Text style={styles.fieldLabel}>CATEGORY / ITEM NAME</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. FUEL, OFFICE SUPPLIES"
                placeholderTextColor="#CBD5E1"
              />
              <Text style={styles.fieldLabel}>REASON / NOTES</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={reason}
                onChangeText={setReason}
                placeholder="Optional description"
                placeholderTextColor="#CBD5E1"
                multiline
                numberOfLines={2}
              />
            </ScrollView>

            <View style={styles.btnRow}>
              <TouchableOpacity
                onPress={() => setIsDetailMode(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveDetail}
                style={styles.saveBtn}
              >
                <Text style={styles.saveText}>Save Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // --- GRID MODE ---
          <View style={[styles.card, { height: '90%' }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Items</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setIsCreateMode(true)}
                  style={styles.addCustomBtn}
                >
                  <Text style={styles.addCustomText}>+ Custom</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeX}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94A3B8"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <TouchableOpacity
                onPress={() => setSortBy('name')}
                style={[
                  styles.sortBtn,
                  sortBy === 'name' && styles.sortBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.sortBtnText,
                    sortBy === 'name' && styles.sortBtnTextActive,
                  ]}
                >
                  Name
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortBy('price')}
                style={[
                  styles.sortBtn,
                  sortBy === 'price' && styles.sortBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.sortBtnText,
                    sortBy === 'price' && styles.sortBtnTextActive,
                  ]}
                >
                  Price
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredItems}
              keyExtractor={item =>
                item.id?.toString() || Math.random().toString()
              }
              renderItem={renderGridItem}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity
                onPress={handleConfirmCart}
                style={styles.confirmBtn}
              >
                <Text style={styles.saveText}>
                  Confirm {totalCartItems > 0 ? `(${totalCartItems})` : ''}{' '}
                  Items
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: { fontSize: 14, color: '#64748B', fontWeight: '700' },
  addCustomBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addCustomText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  // Grid / Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B' },
  clearIcon: { fontSize: 18, color: '#94A3B8', paddingHorizontal: 8 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sortLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  sortBtnActive: { backgroundColor: theme.colors.primary },
  sortBtnText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  sortBtnTextActive: { color: '#FFF' },
  gridRow: { justifyContent: 'space-between' },
  gridCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    width: (width - 48 - 16) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridCardSelected: { borderColor: '#EF4444' },
  qtyBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#EF4444',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 4,
  },
  qtyBadgeText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  detailBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 2,
  },
  detailBtnText: { color: '#334155', fontSize: 16, fontWeight: '800' },
  gridImageContainer: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: 100 },
  placeholderImage: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTextLarge: { fontSize: 36, fontWeight: '700', color: '#94A3B8' },
  gridDetails: { padding: 8 },
  gridName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  gridPrice: { fontSize: 15, fontWeight: '800', color: theme.colors.primary },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnText: { fontSize: 18, fontWeight: '700', color: '#334155' },
  controlQty: { fontSize: 16, fontWeight: '700', color: '#1E293B' },

  // Forms / Detail Mode
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
  },
  pickerBox: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  picker: { color: '#1E293B' },
  quantityPriceRow: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    alignItems: 'center',
  },
  quantityBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  drumWrapper: { marginTop: 8, alignItems: 'center' },
  divider: {
    width: 1.5,
    alignSelf: 'stretch',
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  priceBlock: {
    flex: 1.4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  priceInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
    paddingBottom: 4,
    marginTop: 4,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  subtotalLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#334155',
    backgroundColor: '#F8FAFC',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  multilineInput: { height: 64, textAlignVertical: 'top', paddingTop: 10 },
  inputGroup: { marginBottom: 12 },

  // Image Creation
  imageContainer: { alignItems: 'center', gap: 12, marginBottom: 16 },
  imagePreviewContainer: { position: 'relative' },
  imagePreview: { width: 100, height: 100, borderRadius: 12 },
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
  removeImageText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
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
  imagePlaceholderIcon: { fontSize: 24 },
  imagePlaceholderText: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  changeImageBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeImageText: { fontSize: 14, color: '#475569', fontWeight: '500' },

  // Type Switcher
  typeContainer: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  typeBtnActive: { borderColor: 'transparent' },
  typeBtnActiveIncome: { backgroundColor: '#10B981' },
  typeBtnActiveExpense: { backgroundColor: '#EF4444' },
  typeText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  required: { color: '#EF4444' },

  // Buttons
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
});
