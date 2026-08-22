import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../store/hooks';
import {
  catalogService,
  PublicCatalogDTO,
  PublicItemDTO,
} from '../api/catalogService';
import { PublicCatalogItemCard } from '../components/PublicCatalogItemCard';
import { openContactDeepLink } from '../utils/contactLinks';
import { DEFAULT_ITEM_CATEGORY } from '../../items/constants';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';

export const PublicCatalogScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const token = route.params?.token as string | undefined;
  const [catalog, setCatalog] = useState<PublicCatalogDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientNote, setClientNote] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterMarqueId, setFilterMarqueId] = useState<number | null>(null);

  const formatCategory = (category?: string) => {
    if (!category || category === DEFAULT_ITEM_CATEGORY) return t('items.other');
    return category;
  };

  useEffect(() => {
    if (!token || token === 'undefined') {
      setLoading(false);
      navigation.replace(isAuthenticated ? 'Main' : 'Login');
      return;
    }
    catalogService
      .getPublicCatalog(token)
      .then(data => {
        setCatalog(data);
        const initial: Record<number, number> = {};
        data.items.forEach(item => {
          initial[item.id] = 0;
        });
        setQuantities(initial);
      })
      .catch(() => Alert.alert('Error', 'Catalog not found or unavailable'))
      .finally(() => setLoading(false));
  }, [token]);

  const selectedLines = useMemo(() => {
    if (!catalog) return [];
    return catalog.items
      .filter(item => (quantities[item.id] || 0) > 0)
      .map(item => ({
        itemId: item.id,
        quantity: quantities[item.id],
        item,
      }));
  }, [catalog, quantities]);

  const categoryOptions = useMemo(() => {
    if (!catalog) return [];
    const cats = new Set<string>();
    catalog.items.forEach(item => {
      cats.add(item.category?.trim() || DEFAULT_ITEM_CATEGORY);
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [catalog]);

  const marqueOptions = useMemo(() => {
    if (!catalog) return [];
    const map = new Map<number, string>();
    catalog.items.forEach(item => {
      if (item.marqueId != null && item.marqueTitle) {
        map.set(item.marqueId, item.marqueTitle);
      }
    });
    return Array.from(map.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [catalog]);

  const filteredItems = useMemo(() => {
    if (!catalog) return [];
    const q = searchQuery.toLowerCase().trim();
    return catalog.items.filter(item => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.marqueTitle?.toLowerCase().includes(q);
      const itemCategory = item.category?.trim() || DEFAULT_ITEM_CATEGORY;
      const matchesCategory = !filterCategory || itemCategory === filterCategory;
      const matchesMarque =
        filterMarqueId == null || item.marqueId === filterMarqueId;
      return matchesSearch && matchesCategory && matchesMarque;
    });
  }, [catalog, searchQuery, filterCategory, filterMarqueId]);

  const total = useMemo(
    () =>
      selectedLines.reduce(
        (sum, line) => sum + line.item.unitPrice * line.quantity,
        0,
      ),
    [selectedLines],
  );

  const setQty = (itemId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  const handleSubmit = async () => {
    if (!clientName.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    if (selectedLines.length === 0) {
      Alert.alert('Required', 'Select at least one item');
      return;
    }

    setSubmitting(true);
    try {
      const response = await catalogService.submitPublicOrder(token, {
        clientName: clientName.trim(),
        clientNote: clientNote.trim() || undefined,
        lines: selectedLines.map(line => ({
          itemId: line.itemId,
          quantity: line.quantity,
        })),
      });
      setSubmitted(true);
      await openContactDeepLink(response);
    } catch {
      Alert.alert('Error', 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!catalog) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Catalog not found</Text>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={styles.center}>
        <Text style={styles.successTitle}>Order submitted!</Text>
        <Text style={styles.successText}>
          Your selection was sent. Continue in your messaging app to confirm with
          the seller.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.catalogTitle}>{catalog.name}</Text>
        {catalog.description ? (
          <Text style={styles.catalogDesc}>{catalog.description}</Text>
        ) : null}

        <View style={styles.filters}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t('catalog.search_placeholder')}
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

          {categoryOptions.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipRow}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !filterCategory && styles.filterChipActive,
                ]}
                onPress={() => setFilterCategory(null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !filterCategory && styles.filterChipTextActive,
                  ]}
                >
                  {t('management.all_categories')}
                </Text>
              </TouchableOpacity>
              {categoryOptions.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    filterCategory === cat && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilterCategory(filterCategory === cat ? null : cat)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterCategory === cat && styles.filterChipTextActive,
                    ]}
                  >
                    {formatCategory(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {marqueOptions.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipRow}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterMarqueId == null && styles.filterChipActive,
                ]}
                onPress={() => setFilterMarqueId(null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterMarqueId == null && styles.filterChipTextActive,
                  ]}
                >
                  {t('management.all_marques')}
                </Text>
              </TouchableOpacity>
              {marqueOptions.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.filterChip,
                    filterMarqueId === m.id && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilterMarqueId(filterMarqueId === m.id ? null : m.id)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterMarqueId === m.id && styles.filterChipTextActive,
                    ]}
                  >
                    {m.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {filteredItems.length === 0 ? (
          <Text style={styles.emptyText}>{t('catalog.no_matching_items')}</Text>
        ) : (
          filteredItems.map((item: PublicItemDTO) => (
            <PublicCatalogItemCard
              key={item.id}
              item={item}
              quantity={quantities[item.id] || 0}
              onIncrease={() => setQty(item.id, 1)}
              onDecrease={() => setQty(item.id, -1)}
            />
          ))
        )}

        <Text style={styles.label}>Your name *</Text>
        <TextInput
          style={styles.input}
          value={clientName}
          onChangeText={setClientName}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={clientNote}
          onChangeText={setClientNote}
          placeholder="Delivery address, special requests..."
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.total}>Total: {total.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit order</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { padding: 16, paddingBottom: 120 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F1F5F9',
  },
  catalogTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  catalogDesc: { fontSize: 15, color: '#64748B', marginBottom: 16 },
  filters: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  clearIcon: {
    fontSize: 18,
    color: '#94A3B8',
    paddingHorizontal: 8,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    color: '#94A3B8',
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  total: { flex: 1, fontSize: 18, fontWeight: '800', color: '#0F172A' },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  errorText: { color: '#DC2626', fontSize: 16 },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: { fontSize: 15, color: '#64748B', textAlign: 'center' },
});
