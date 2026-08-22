import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  transactionService,
  TransactionItemDTO,
  DiscountType,
  TransactionStatus,
  PaymentStatus,
} from '../api/transactionService';
import { SelectedCartItemRow } from '../components/SelectedCartItemRow';
import { TransactionInventoryRow } from '../components/TransactionInventoryRow';
import { DiscountField } from '../components/DiscountField';
import { calcTransactionTotals } from '../utils/discountUtils';
import {
  buildTransactionItems,
  getItemDisplayName,
  getItemImageUri,
  parseTransactionDiscount,
  validateTransactionDiscount,
} from '../utils/transactionFormHelpers';
import { fetchMissions } from '../../../store/missionSlice';
import { fetchLocations } from '../../../store/locationSlice';
import { fetchItems } from '../../../store/itemSlice';
import { fetchClients } from '../../../store/clientSlice';
import { fetchProviders } from '../../../store/providerSlice';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { CategoryPicker } from '../components/CategoryPicker';
import { OptionalEntityPicker } from '../components/OptionalEntityPicker';
import { OptionalClientPicker } from '../components/OptionalClientPicker';
import { OptionalProviderPicker } from '../components/OptionalProviderPicker';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { ItemDTO } from '../../items/api/itemService';
import { useTranslation } from 'react-i18next';

export const CreateTransactionScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<{ params?: { initialType?: 'INCOME' | 'EXPENSE' } }>>();
  const dispatch = useAppDispatch();

  const missions = useAppSelector(state => state.missions.items);
  const locations = useAppSelector(state => state.locations.items);
  const inventoryItems = useAppSelector(state => state.items.items);
  const user = useAppSelector(state => state.auth.user);

  const type = route.params?.initialType ?? 'EXPENSE';

  const [description, setDescription] = useState('');
  const [fuelTank, setFuelTank] = useState<'ft1' | 'ft2' | 'ft3'>('ft1');
  const [category, setCategory] = useState<string>('');
  const [missionId, setMissionId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [snapBalance, setSnapBalance] = useState<'AFTER' | 'BEFORE' | undefined>(undefined);
  const [status, setStatus] = useState<TransactionStatus>('DELIVERED');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  
  const [cart, setCart] = useState<Record<string, TransactionItemDTO>>({});
  const [transactionDiscountType, setTransactionDiscountType] = useState<DiscountType | null>(null);
  const [transactionDiscountValue, setTransactionDiscountValue] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMissions());
    dispatch(fetchLocations());
    dispatch(fetchItems());
    dispatch(fetchClients());
    dispatch(fetchProviders());
  }, [dispatch]);

  const handleIncrement = (item: ItemDTO) => {
    setCart(prev => {
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
          category: item.category,
          quantity: 1,
          unitPrice: item.unitPrice || 0,
          reason: item.description || '',
          type: type,
        },
      };
    });
  };

  const handleDecrement = (itemId: number) => {
    setCart(prev => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: existing.quantity - 1 },
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

  const handleItemDiscountChange = (key: string, discountType: DiscountType | null, value: string) => {
    setCart(prev => {
      const existing = prev[key];
      if (!existing) return prev;
      return {
        ...prev,
        [key]: {
          ...existing,
          discountType,
          discountValueInput: value,
          discountValue: value === '' ? null : parseFloat(value),
        },
      };
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
    .filter(
      i =>
        i.active &&
        i.type === type &&
        i.name.toLowerCase().includes(itemSearchQuery.toLowerCase()),
    )
    .slice(0, 10); // Limit to 10 for performance

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
    // Validate line item discounts
    for (const [key, item] of Object.entries(cart)) {
      const error = validateTransactionDiscount(item.discountType, item.discountValueInput);
      if (error) {
        const itemName = getItemDisplayName(item, inventoryItems);
        Alert.alert('Error', `${itemName}: ${t(`transaction.${error}`)}`);
        return;
      }
    }
    try {
      setLoading(true);
      await transactionService.create({
        description,
        type,
        fuelTank,
        category: category.trim() || undefined,
        missionId: missionId ?? null,
        locationId: locationId ?? null,
        clientId: type === 'INCOME' ? clientId : null,
        providerId: type === 'EXPENSE' ? providerId : null,
        userId: user?.id,
        snapBalance,
        status,
        paymentStatus,
        transactionDate: new Date().toISOString(),
        ...parseTransactionDiscount(transactionDiscountType, transactionDiscountValue),
        items: previewItems,
      });
      Alert.alert('Success', 'Transaction created.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

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
            {type === 'INCOME' ? t('transaction.new_income') : t('transaction.new_expense')}
          </Text>
          <Text style={[
            styles.summaryTotal,
            { color: type === 'INCOME' ? theme.colors.success : theme.colors.danger }
          ]}>
            ${totals.totalAmount.toFixed(2)}
          </Text>
          {totals.discountAmount > 0 && (
            <View style={styles.discountFeedbackRow}>
              <Text style={[styles.discountFeedbackText, { color: type === 'INCOME' ? theme.colors.success : theme.colors.danger }]}>
                {t('transaction.gross_subtotal')}: ${totals.lines.reduce((sum, line) => sum + line.subtotal, 0).toFixed(2)}
              </Text>
              <Text style={[styles.discountFeedbackText, { color: type === 'INCOME' ? theme.colors.success : theme.colors.danger }]}>
                {t('transaction.discount')}: -${totals.discountAmount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryCount}>{t('transaction.items_total', { count: totalQuantity })}</Text>
          </View>
        </View>

        {/* Transaction Discount */}
        <Card style={styles.topDiscountCard}>
          <Text style={styles.topDiscountLabel}>{t('transaction.discount')}</Text>
          <DiscountField
            discountType={transactionDiscountType}
            discountValue={transactionDiscountValue}
            onChange={(discountType, value) => {
              setTransactionDiscountType(discountType);
              setTransactionDiscountValue(value);
            }}
          />
        </Card>

        {/* SECTION 1: Selected Items */}
        {cartItemsArray.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('transaction.selected_items')}</Text>
            <View style={styles.selectedItemsList}>
              {Object.entries(cart).map(([key, item], index) => (
                <SelectedCartItemRow
                  key={key}
                  item={item}
                  displayName={getItemDisplayName(item, inventoryItems)}
                  imageUri={getItemImageUri(item, inventoryItems)}
                  onDecrement={() => handleDecrement(Number(key))}
                  onIncrement={() => handleIncrement({ id: item.itemId } as ItemDTO)}
                  onRemove={() => handleRemove(key)}
                  lineTotal={totals.lines[index]?.amount}
                  onDiscountChange={(discountType, value) => handleItemDiscountChange(key, discountType, value)}
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
          <View style={styles.inventoryList}>
            {filteredInventory.map(item => (
              <TransactionInventoryRow
                key={item.id}
                item={item}
                quantity={cart[item.id!]?.quantity || 0}
                onPress={() => handleIncrement(item)}
              />
            ))}
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
            <Text style={styles.label}>{t('transaction.category_optional')}</Text>
            <CategoryPicker value={category} onChange={setCategory} />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>{t('transaction.mission_optional')}</Text>
              <OptionalEntityPicker
                title={t('transactions.mission_title')}
                value={missionId}
                onChange={setMissionId}
                items={missions.filter(m => m.id != null).map(m => ({ id: m.id!, label: m.title }))}
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>{t('transaction.location_optional')}</Text>
              <OptionalEntityPicker
                title={t('transactions.location_title')}
                value={locationId}
                onChange={setLocationId}
                items={locations.filter(l => l.id != null).map(l => ({ id: l.id!, label: l.name }))}
              />
            </View>
          </View>

          {type === 'INCOME' ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('transaction.client_optional')}</Text>
              <OptionalClientPicker value={clientId} onChange={setClientId} />
            </View>
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('transaction.provider_optional')}</Text>
              <OptionalProviderPicker value={providerId} onChange={setProviderId} />
            </View>
          )}

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

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('transaction.status')}</Text>
            <View style={styles.chipRow}>
              {(['CONFIRMED', 'PREPARED', 'DELIVERED', 'CANCELLED'] as const).map(opt => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setStatus(opt)}
                  style={[styles.chip, status === opt && styles.chipActive]}
                >
                  <Text style={[styles.chipText, status === opt && styles.chipTextActive]}>
                    {t(`transaction.status_${opt}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('transaction.payment_status')}</Text>
            <View style={styles.chipRow}>
              {(['PAID', 'CREDIT', 'UNPAID', 'PARTIAL'] as const).map(opt => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setPaymentStatus(opt)}
                  style={[styles.chip, paymentStatus === opt && styles.chipActive]}
                >
                  <Text style={[styles.chipText, paymentStatus === opt && styles.chipTextActive]}>
                    {t(`transaction.payment_${opt}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={t('transaction.submit_transaction')} 
          onPress={handleSubmit} 
          loading={loading}
          style={styles.submitBtn}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.m, paddingBottom: 140, maxWidth: 800, alignSelf: 'center', width: '100%', gap: theme.spacing.xl },
  
  // Section 0
  summaryHeader: { 
    alignItems: 'center', 
    paddingVertical: theme.spacing.xl, 
    borderRadius: theme.radius.xl,
    marginVertical: theme.spacing.s,
    ...theme.shadows.md,
  },
  discountFeedbackRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.s,
    alignItems: 'center',
    opacity: 0.8,
  },
  discountFeedbackText: {
    fontSize: 14,
    fontWeight: '700',
  },
  topDiscountCard: {
    padding: theme.spacing.m,
    gap: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.l,
    ...theme.shadows.sm,
  },
  topDiscountLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
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
  
  inventoryList: { gap: 0 },
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
