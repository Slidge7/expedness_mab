import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  transactionService,
  TransactionItemDTO,
  DiscountType,
} from '../api/transactionService';
import { SelectedCartItemRow } from '../components/SelectedCartItemRow';
import { DiscountField } from '../components/DiscountField';
import { calcTransactionTotals } from '../utils/discountUtils';
import {
  buildTransactionItems,
  getItemDisplayName,
  parseTransactionDiscount,
  validateTransactionDiscount,
} from '../utils/transactionFormHelpers';
import { fetchMissions } from '../../../store/missionSlice';
import { fetchLocations } from '../../../store/locationSlice';
import { fetchItems } from '../../../store/itemSlice';
import { fetchClients } from '../../../store/clientSlice';
import { fetchProviders } from '../../../store/providerSlice';
import { theme } from '../../../theme';
import { CategoryPicker } from '../components/CategoryPicker';
import { OptionalEntityPicker } from '../components/OptionalEntityPicker';
import {
  TransactionPartyPicker,
  PartyMode,
} from '../components/TransactionPartyPicker';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { ItemDTO } from '../../items/api/itemService';
import { useTranslation } from 'react-i18next';

type RouteParams = { transactionId: number };

export const EditTransactionScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { transactionId } = route.params;
  const dispatch = useAppDispatch();

  const missions = useAppSelector(state => state.missions.items);
  const locations = useAppSelector(state => state.locations.items);
  const clients = useAppSelector(state => state.clients.items);
  const providers = useAppSelector(state => state.providers.items);
  const inventoryItems = useAppSelector(state => state.items.items);
  const user = useAppSelector(state => state.auth.user);

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  const [description, setDescription] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [fuelTank, setFuelTank] = useState<'ft1' | 'ft2' | 'ft3'>('ft1');
  const [category, setCategory] = useState('');
  const [missionId, setMissionId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [partyMode, setPartyMode] = useState<PartyMode>('none');
  const [clientId, setClientId] = useState<number | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [snapBalance, setSnapBalance] = useState<'AFTER' | 'BEFORE' | undefined>(undefined);
  
  const [cart, setCart] = useState<Record<string, TransactionItemDTO>>({});
  const [transactionDiscountType, setTransactionDiscountType] = useState<DiscountType | null>(null);
  const [transactionDiscountValue, setTransactionDiscountValue] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchMissions());
    dispatch(fetchLocations());
    dispatch(fetchItems());
    dispatch(fetchClients());
    dispatch(fetchProviders());
    loadTransaction();
  }, []);

  const loadTransaction = async () => {
    try {
      setFetching(true);
      const tx = await transactionService.getById(transactionId);
      setDescription(tx.description);
      setType(tx.type);
      setFuelTank((tx.fuelTank as any) || 'ft1');
      setCategory(tx.category || '');
      setMissionId(tx.missionId ?? null);
      setLocationId(tx.locationId ?? null);
      if (tx.clientId != null) {
        setPartyMode('client');
        setClientId(tx.clientId);
        setProviderId(null);
      } else if (tx.providerId != null) {
        setPartyMode('provider');
        setProviderId(tx.providerId);
        setClientId(null);
      } else {
        setPartyMode('none');
        setClientId(null);
        setProviderId(null);
      }

      // Convert array of items to cart object keyed by itemId (or random string if no itemId)
      const initialCart: Record<string, TransactionItemDTO> = {};
      tx.items?.forEach((item, index) => {
        const key = item.itemId ? String(item.itemId) : `custom-${index}`;
        initialCart[key] = item;
      });
      setCart(initialCart);
      setTransactionDiscountType(tx.discountType ?? null);
      setTransactionDiscountValue(
        tx.discountValue != null ? String(tx.discountValue) : '',
      );

    } catch (e) {
      Alert.alert('Error', 'Failed to load transaction.');
      navigation.goBack();
    } finally {
      setFetching(false);
    }
  };

  const handleIncrement = (item: ItemDTO | TransactionItemDTO) => {
    setCart(prev => {
      const id = 'itemId' in item ? item.itemId : item.id;
      const key = String(id);
      const existing = prev[key];
      if (existing) {
        return {
          ...prev,
          [key]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      
      const invItem = item as ItemDTO;
      return {
        ...prev,
        [key]: {
          itemId: invItem.id,
          category: invItem.category,
          quantity: 1,
          unitPrice: invItem.unitPrice || 0,
          reason: invItem.description || '',
          type: type,
        },
      };
    });
  };

  const handleDecrement = (key: string) => {
    setCart(prev => {
      const existing = prev[key];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: { ...existing, quantity: existing.quantity - 1 },
      };
    });
  };

  const handleRemove = (key: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const cartItemsArray = Object.values(cart);
  const totalQuantity = cartItemsArray.reduce((sum, i) => sum + i.quantity, 0);
  const previewItems = buildTransactionItems(cart, type);
  const txDiscount = parseTransactionDiscount(
    transactionDiscountType,
    transactionDiscountValue,
  );
  const totals = calcTransactionTotals(previewItems, txDiscount);

  const filteredInventory = inventoryItems
    .filter(i => i.active && i.name.toLowerCase().includes(itemSearchQuery.toLowerCase()))
    .slice(0, 10);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description.');
      return;
    }
    if (cartItemsArray.length === 0) {
      Alert.alert('Error', 'Please add at least one item.');
      return;
    }
    const discountError = validateTransactionDiscount(
      transactionDiscountType,
      transactionDiscountValue,
    );
    if (discountError) {
      Alert.alert('Error', t(`transaction.${discountError}`));
      return;
    }
    try {
      setSaving(true);
      await transactionService.update(transactionId, {
        description,
        type,
        fuelTank,
        category: category.trim() || undefined,
        missionId: missionId ?? null,
        locationId: locationId ?? null,
        clientId: partyMode === 'client' ? clientId : null,
        providerId: partyMode === 'provider' ? providerId : null,
        userId: user?.id,
        snapBalance,
        transactionDate: new Date().toISOString(),
        ...parseTransactionDiscount(transactionDiscountType, transactionDiscountValue),
        items: previewItems,
      });
      Alert.alert('Success', 'Transaction updated.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update transaction.');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* SECTION 0: Summary */}
        <View style={[
          styles.summaryHeader, 
          { backgroundColor: type === 'INCOME' ? theme.colors.successLight : theme.colors.dangerLight }
        ]}>
          <Text style={[
            styles.summaryLabel,
            { color: type === 'INCOME' ? theme.colors.success : theme.colors.danger }
          ]}>
            {type === 'INCOME' ? t('transaction.edit_income') : t('transaction.edit_expense')}
          </Text>
          <Text style={[
            styles.summaryTotal,
            { color: type === 'INCOME' ? theme.colors.success : theme.colors.danger }
          ]}>
            ${totals.totalAmount.toFixed(2)}
          </Text>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryCount}>{t('transaction.items_total', { count: totalQuantity })}</Text>
          </View>
        </View>

        {/* SECTION 1: Selected Items */}
        {cartItemsArray.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('transaction.selected_items')}</Text>
            <View style={styles.selectedItemsList}>
              {Object.entries(cart).map(([key, item]) => (
                <SelectedCartItemRow
                  key={key}
                  item={item}
                  displayName={getItemDisplayName(item, inventoryItems)}
                  onDecrement={() => handleDecrement(key)}
                  onIncrement={() => handleIncrement(item)}
                  onRemove={() => handleRemove(key)}
                />
              ))}
            </View>
          </View>
        )}

        {/* SECTION 2: Item List with Search */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('transaction.add_items')}</Text>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t('transaction.search_inventory')}
              placeholderTextColor={theme.colors.textSecondary}
              value={itemSearchQuery}
              onChangeText={setItemSearchQuery}
            />
          </View>
          <View style={styles.inventoryGrid}>
            {filteredInventory.map(item => {
              const key = String(item.id);
              const qty = cart[key]?.quantity || 0;
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.inventoryCard, qty > 0 && styles.inventoryCardActive]}
                  onPress={() => handleIncrement(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.inventoryCardHeader}>
                    <Text style={styles.inventoryItemName} numberOfLines={2}>{item.name}</Text>
                    {qty > 0 ? (
                      <View style={styles.inventoryItemBadge}>
                        <Text style={styles.inventoryItemBadgeText}>{qty}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.inventoryItemPrice}>${item.unitPrice?.toFixed(2) || '0.00'}</Text>
                  {qty === 0 && (
                    <View style={styles.addButtonWrapper}>
                      <Text style={styles.addButtonText}>+ ADD</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
            {filteredInventory.length === 0 && (
              <View style={styles.emptyStateWrapper}>
                <Text style={styles.emptyText}>{t('transaction.no_matching_items')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* SECTION 3: Details */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('transaction.transaction_details')}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('transaction.description')}</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder={t('transaction.general_description')}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('transaction.payment_mode')}</Text>
            <View style={styles.chipRow}>
              {(['ft1', 'ft2', 'ft3'] as const).map(ft => (
                <TouchableOpacity
                  key={ft}
                  onPress={() => setFuelTank(ft)}
                  style={[styles.chip, fuelTank === ft && styles.chipActive]}
                >
                  <Text style={[styles.chipText, fuelTank === ft && styles.chipTextActive]}>
                    {ft.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('transaction.discount')}</Text>
            <DiscountField
              discountType={transactionDiscountType}
              discountValue={transactionDiscountValue}
              onChange={(discountType, value) => {
                setTransactionDiscountType(discountType);
                setTransactionDiscountValue(value);
              }}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('transaction.category_optional')}</Text>
            <CategoryPicker value={category} onChange={setCategory} />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>{t('transaction.mission_optional')}</Text>
              <OptionalEntityPicker
                title="Mission"
                value={missionId}
                onChange={setMissionId}
                items={missions.filter(m => m.id != null).map(m => ({ id: m.id!, label: m.title }))}
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>{t('transaction.location_optional')}</Text>
              <OptionalEntityPicker
                title="Location"
                value={locationId}
                onChange={setLocationId}
                items={locations.filter(l => l.id != null).map(l => ({ id: l.id!, label: l.name }))}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('transaction.client_provider_optional')}</Text>
            <TransactionPartyPicker
              mode={partyMode}
              clientId={clientId}
              providerId={providerId}
              clients={clients.filter(c => c.id != null).map(c => ({ id: c.id!, label: c.name }))}
              providers={providers.filter(p => p.id != null).map(p => ({ id: p.id!, label: p.name }))}
              onChange={(mode, nextClientId, nextProviderId) => {
                setPartyMode(mode);
                setClientId(nextClientId);
                setProviderId(nextProviderId);
              }}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('transaction.balance_snapshot')}</Text>
            <View style={styles.chipRow}>
              {([undefined, 'BEFORE', 'AFTER'] as const).map(opt => (
                <TouchableOpacity
                  key={String(opt)}
                  onPress={() => setSnapBalance(opt)}
                  style={[styles.chip, snapBalance === opt && styles.chipActive]}
                >
                  <Text style={[styles.chipText, snapBalance === opt && styles.chipTextActive]}>
                    {opt === undefined ? t('transaction.none') : opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={saving ? t('transaction.saving') : t('transaction.save_changes')} 
          onPress={handleSubmit} 
          loading={saving}
          style={styles.submitBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: theme.spacing.m, paddingBottom: 140, maxWidth: 800, alignSelf: 'center', width: '100%', gap: theme.spacing.xl },
  
  // Section 0
  summaryHeader: { 
    alignItems: 'center', 
    paddingVertical: theme.spacing.xl, 
    borderRadius: theme.radius.xl,
    marginVertical: theme.spacing.s,
    ...theme.shadows.md,
  },
  summaryLabel: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: theme.spacing.s },
  summaryTotal: { fontSize: 56, fontWeight: '900', marginVertical: theme.spacing.xs, letterSpacing: -1 },
  summaryBadge: { backgroundColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: theme.radius.round, marginTop: theme.spacing.s },
  summaryCount: { fontSize: 14, color: theme.colors.text, fontWeight: '700' },

  // Shared Section Styles
  sectionContainer: { gap: theme.spacing.m },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginLeft: theme.spacing.xs },
  
  // Section 1: Selected Items
  emptyText: { textAlign: 'center', color: theme.colors.textSecondary, fontWeight: '500', paddingVertical: theme.spacing.l, fontSize: 16 },
  selectedItemsList: { gap: theme.spacing.s },
  selectedItemCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: theme.spacing.m, 
    backgroundColor: theme.colors.surface, 
    borderRadius: theme.radius.l, 
    ...theme.shadows.sm 
  },
  selectedItemInfo: { flex: 1 },
  selectedItemName: { fontWeight: '700', fontSize: 16, color: theme.colors.text },
  selectedItemPrice: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  
  quantityControlsWrapper: { alignItems: 'flex-end', justifyContent: 'center', marginRight: theme.spacing.m },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.inputBg, borderRadius: theme.radius.round, paddingHorizontal: 4, paddingVertical: 4 },
  qtyBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.round, ...theme.shadows.sm },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  qtyText: { fontSize: 16, fontWeight: '800', color: theme.colors.text, minWidth: 32, textAlign: 'center' },
  itemRowTotal: { fontWeight: '800', fontSize: 16, color: theme.colors.primary, marginTop: 8 },
  
  removeBtn: { padding: theme.spacing.s, backgroundColor: theme.colors.dangerLight, borderRadius: theme.radius.round },
  removeBtnText: { color: theme.colors.danger, fontSize: 16, fontWeight: '900' },

  // Section 2: Search & Add
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.l, paddingHorizontal: theme.spacing.m, ...theme.shadows.sm },
  searchIcon: { fontSize: 18, marginRight: theme.spacing.s, opacity: 0.5 },
  searchInput: { flex: 1, paddingVertical: 16, fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  
  inventoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.s },
  inventoryCard: { 
    width: '48%', 
    backgroundColor: theme.colors.surface, 
    borderRadius: theme.radius.l, 
    padding: theme.spacing.m,
    ...theme.shadows.sm,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  inventoryCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  inventoryCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.s },
  inventoryItemName: { fontWeight: '700', fontSize: 15, color: theme.colors.text, flex: 1, marginRight: theme.spacing.xs },
  inventoryItemBadge: { backgroundColor: theme.colors.primary, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  inventoryItemBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  inventoryItemPrice: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: theme.spacing.m },
  addButtonWrapper: { backgroundColor: theme.colors.inputBg, paddingVertical: 8, borderRadius: theme.radius.m, alignItems: 'center' },
  addButtonText: { color: theme.colors.primary, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  emptyStateWrapper: { width: '100%', alignItems: 'center', paddingVertical: theme.spacing.xl },

  // Section 3: Details
  formGroup: { marginBottom: theme.spacing.m },
  formRow: { flexDirection: 'row', gap: theme.spacing.m },
  formGroupHalf: { flex: 1, marginBottom: theme.spacing.m },
  label: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.s },
  input: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.m, padding: 16, fontSize: 16, color: theme.colors.text, ...theme.shadows.sm },
  chipRow: { flexDirection: 'row', gap: theme.spacing.s, flexWrap: 'wrap' },
  chip: { flex: 1, minWidth: 90, paddingVertical: 14, backgroundColor: theme.colors.surface, borderRadius: theme.radius.m, alignItems: 'center', ...theme.shadows.sm, borderWidth: 2, borderColor: 'transparent' },
  chipActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.textSecondary, fontWeight: '700', fontSize: 14 },
  chipTextActive: { color: theme.colors.primary },

  // Footer
  footer: { 
    position: 'absolute', 
    bottom: 0, left: 0, right: 0, 
    padding: theme.spacing.m, 
    paddingBottom: theme.spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.9)', 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.border, 
    alignItems: 'center' 
  },
  submitBtn: { width: '100%', maxWidth: 800, paddingVertical: 18, borderRadius: theme.radius.xl },
});
