import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchItemById,
  deleteItem,
  clearSelectedItem,
} from '../../../store/itemSlice';
import { enableStock, disableStock } from '../../../store/stockSlice';
import { theme } from '../../../theme';

export const ItemDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();

  const { selectedItem, loading } = useAppSelector(state => state.items);
  const stockLoading = useAppSelector(state => state.stock.loading);
  const [deleting, setDeleting] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const itemId = route.params?.itemId;

  useEffect(() => {
    if (itemId) {
      dispatch(fetchItemById(itemId));
    }

    return () => {
      dispatch(clearSelectedItem());
    };
  }, [itemId, dispatch]);

  const handleEdit = () => {
    if (selectedItem?.id) {
      navigation.navigate('EditItem', { itemId: selectedItem.id });
    }
  };

  const handleEnableStock = async () => {
    if (!itemId) return;
    setEnabling(true);
    try {
      await dispatch(enableStock({ itemId, initialStock: 0 })).unwrap();
      await dispatch(fetchItemById(itemId));
      navigation.navigate('ItemStockDetail', { itemId });
    } catch {
      Alert.alert('Error', 'Failed to enable stock tracking.');
    } finally {
      setEnabling(false);
    }
  };

  const handleViewStock = () => {
    if (itemId) {
      navigation.navigate('ItemStockDetail', { itemId });
    }
  };

  const handleDisableStock = () => {
    if (!itemId) return;
    Alert.alert(
      'Disable Stock Tracking',
      'Stock will be reset to zero for this item.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            setDisabling(true);
            try {
              await dispatch(disableStock(itemId)).unwrap();
              await dispatch(fetchItemById(itemId));
            } catch {
              Alert.alert('Error', 'Failed to disable stock tracking.');
            } finally {
              setDisabling(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await dispatch(deleteItem(selectedItem!.id!)).unwrap();
              Alert.alert('Success', 'Item deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading || !selectedItem) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          {selectedItem.imageMedium ? (
            <Image
              source={{
                uri: `data:image/jpeg;base64,${selectedItem.imageMedium}`,
              }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>
                {selectedItem.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Type Badge */}
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  selectedItem.type === 'INCOME' ? '#10B981' : '#EF4444',
              },
            ]}
          >
            <Text style={styles.typeBadgeText}>
              {selectedItem.type === 'INCOME' ? '↑ INCOME' : '↓ EXPENSE'}
            </Text>
          </View>

          {/* Status Badge */}
          {!selectedItem.active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>INACTIVE</Text>
            </View>
          )}
        </View>

        {/* Header Info */}
        <View style={styles.headerSection}>
          <Text style={styles.itemName}>{selectedItem.name}</Text>
          <Text style={styles.itemPrice}>
            ${selectedItem.unitPrice?.toFixed(2)}
          </Text>
          {selectedItem.unit && (
            <Text style={styles.itemUnit}>per {selectedItem.unit}</Text>
          )}
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>

          <DetailRow
            icon="📂"
            label="Category"
            value={selectedItem.category || 'Uncategorized'}
          />

          {selectedItem.description && (
            <DetailRow
              icon="📝"
              label="Description"
              value={selectedItem.description}
              multiline
            />
          )}

          <DetailRow
            icon="📦"
            label="Unit"
            value={selectedItem.unit || 'N/A'}
          />

          <DetailRow
            icon="⚡"
            label="Status"
            value={selectedItem.active ? 'Active' : 'Inactive'}
            valueStyle={{
              color: selectedItem.active ? '#10B981' : '#F59E0B',
              fontWeight: '700',
            }}
          />

          {selectedItem.providerNames && selectedItem.providerNames.length > 0 && (
            <DetailRow
              icon="🏢"
              label="Providers"
              value={selectedItem.providerNames.join(', ')}
            />
          )}
        </View>

        {/* Metadata Section */}
        <View style={styles.metadataSection}>
          <Text style={styles.sectionTitle}>Information</Text>

          <DetailRow
            icon="👤"
            label="Created By"
            value={selectedItem.createdBy || 'N/A'}
          />

          <DetailRow
            icon="📅"
            label="Created At"
            value={formatDate(selectedItem.createdAt)}
          />
        </View>

        {/* Stock Section */}
        <View style={styles.stockSection}>
          <Text style={styles.sectionTitle}>Stock</Text>

          {selectedItem.stockEnabled ? (
            <>
              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>
                  {selectedItem.currentStock ?? 0} in stock
                  {selectedItem.unit ? ` ${selectedItem.unit}` : ''}
                </Text>
              </View>

              {selectedItem.minStock != null && (
                <Text style={styles.minStockHint}>
                  Minimum: {selectedItem.minStock}
                </Text>
              )}

              <View style={styles.stockActions}>
                <TouchableOpacity
                  style={styles.viewStockBtn}
                  onPress={handleViewStock}
                >
                  <Text style={styles.viewStockBtnText}>Manage Stock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.disableStockBtn}
                  onPress={handleDisableStock}
                  disabled={disabling}
                >
                  {disabling ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Text style={styles.disableStockBtnText}>Disable</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.enableStockBtn}
              onPress={handleEnableStock}
              disabled={enabling || stockLoading}
            >
              {enabling ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.enableStockBtnText}>Enable Stock Tracking</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={handleEdit}
          disabled={deleting}
        >
          <Text style={styles.editBtnText}>✏️ Edit Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper Component
const DetailRow = ({
  icon,
  label,
  value,
  multiline,
  valueStyle,
}: {
  icon: string;
  label: string;
  value: string;
  multiline?: boolean;
  valueStyle?: any;
}) => (
  <View style={[styles.detailRow, multiline && styles.detailRowMultiline]}>
    <View style={styles.detailLabel}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailLabelText}>{label}</Text>
    </View>
    <Text
      style={[styles.detailValue, valueStyle]}
      numberOfLines={multiline ? undefined : 1}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  // Image Section
  imageSection: {
    position: 'relative',
    backgroundColor: '#FFF',
  },
  itemImage: {
    width: '100%',
    height: 320,
  },
  placeholderImage: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
    fontWeight: '700',
    color: '#94A3B8',
  },
  typeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inactiveBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    elevation: 4,
  },
  inactiveBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Header Section
  headerSection: {
    backgroundColor: '#FFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  itemName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  itemUnit: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },

  // Details Section
  detailsSection: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 20,
  },
  metadataSection: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 20,
  },
  stockSection: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 20,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  stockBadgeText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
  },
  minStockHint: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  stockActions: {
    flexDirection: 'row',
    gap: 12,
  },
  enableStockBtn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  enableStockBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  viewStockBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewStockBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  disableStockBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  disableStockBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 18,
  },
  detailLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
  },

  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
  },
  deleteBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  editBtn: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
