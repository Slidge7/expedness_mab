import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDashboard } from '../../../store/overviewSlice';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import { Preset, GroupBy } from '../api/overviewService';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

// ── Constants ──────────────────────────────────────────────────────────────────

const PRESETS: { label: string; value: Preset }[] = [
  { label: 'Today', value: 'TODAY' },
  { label: 'This Week', value: 'THIS_WEEK' },
  { label: 'This Month', value: 'THIS_MONTH' },
];

const PERIOD_TABS: { label: string; value: GroupBy }[] = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
];

const CAT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const CHART_H = 110;

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number = 0) =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const shortLabel = (label: string, groupBy: GroupBy): string => {
  if (groupBy === 'DAILY') return label.slice(5); // "01-15"
  if (groupBy === 'MONTHLY') return label.slice(0, 3); // "Jan"
  return label.replace('Week ', 'W'); // "W3"
};

// ── Component ──────────────────────────────────────────────────────────────────

export const DashboardScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const Empty = ({ text }: { text: string }) => <Text style={styles.empty}>{text}</Text>;

  const LegendDot = ({ color, label }: { color: string; label: string }) => (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );

  const ProgressRow = ({ label, amount, count, pct, color }: { label: string; amount: number; count: number; pct: number; color: string }) => (
    <View style={styles.progressRow}>
      <View style={[styles.progressDot, { backgroundColor: color }]} />
      <View style={styles.progressBody}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel} numberOfLines={1}>{label}</Text>
          <Text style={styles.progressAmount}>${fmt(amount)}</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: color }]} />
        </View>
        <Text style={styles.progressMeta}>{count} transactions · {pct.toFixed(1)}%</Text>
      </View>
    </View>
  );

  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user } = useAppSelector(s => s.auth);
  const { dashboard, loading, error } = useAppSelector(s => s.overview);

  const [preset, setPreset] = useState<Preset>('THIS_MONTH');
  const [groupBy, setGroupBy] = useState<GroupBy>('DAILY');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchDashboard({ preset, groupBy }));
  }, [preset, groupBy, dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchDashboard({ preset, groupBy }));
    setRefreshing(false);
  }, [preset, groupBy, dispatch]);

  // Derived
  const bal = dashboard?.balance;
  const txn = dashboard?.transactions;
  const maxNet = Math.max(
    ...(dashboard?.byPeriod ?? []).map(e => Math.max(e.income, e.expense)),
    1,
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.welcome}>{t('dashboard.hello_user', { username: user?.username || '' })}</Text>
          <Text style={styles.subtitle}>{t('dashboard.store_summary')}</Text>
        </View>

        {/* Preset pills */}
        <View style={styles.pillRow}>
          {PRESETS.map(p => (
            <TouchableOpacity
              key={p.value}
              style={[styles.pill, preset === p.value && styles.pillActive]}
              onPress={() => setPreset(p.value)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.pillLabel,
                  preset === p.value && styles.pillLabelActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && !dashboard ? (
        <ActivityIndicator
          color={theme.colors.primary}
          style={{ marginTop: 48 }}
          size="large"
        />
      ) : (
        <View style={styles.content}>
          {/* ── Balance Card ──────────────────────────────────────────────── */}
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceCardLabel}>{t('dashboard.total_cash')}</Text>
            <Text style={styles.balanceCardTotal}>${fmt(bal?.total ?? 0)}</Text>
            
            <View style={styles.quickActions}>
               <Button 
                 title={t('dashboard.add_income')} 
                 variant="success" 
                 style={styles.actionBtn} 
                 onPress={() => navigation.navigate('CreateTransaction', { initialType: 'INCOME' })} 
               />
               <Button 
                 title={t('dashboard.add_expense')} 
                 variant="danger" 
                 style={styles.actionBtn} 
                 onPress={() => navigation.navigate('CreateTransaction', { initialType: 'EXPENSE' })} 
               />
            </View>
          </Card>

          {/* ── Income / Expense / Net ─────────────────────────────────────── */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard} noPadding>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Ionicons name="arrow-up" size={20} color={theme.colors.success} />
              </View>
              <Text style={styles.statCardLabel}>{t('nav.income')}</Text>
              <Text style={[styles.statCardValue, { color: theme.colors.success }]}>
                ${fmt(txn?.totalIncome)}
              </Text>
            </Card>
            <Card style={styles.statCard} noPadding>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.danger + '20' }]}>
                <Ionicons name="arrow-down" size={20} color={theme.colors.danger} />
              </View>
              <Text style={styles.statCardLabel}>{t('nav.expense')}</Text>
              <Text style={[styles.statCardValue, { color: theme.colors.danger }]}>
                ${fmt(txn?.totalExpense)}
              </Text>
            </Card>
            <Card style={styles.statCard} noPadding>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="wallet-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.statCardLabel}>{t('dashboard.total_cash')}</Text>
              <Text
                style={[
                  styles.statCardValue,
                  {
                    color: (txn?.net ?? 0) >= 0 ? theme.colors.success : theme.colors.danger,
                  },
                ]}
              >
                {(txn?.net ?? 0) < 0 ? '-' : ''}${fmt(Math.abs(txn?.net ?? 0))}
              </Text>
            </Card>
          </View>

          {/* ── Period Chart ───────────────────────────────────────────────── */}
          <Section title={t('dashboard.sales_expenses_over_time')}>
            {/* GroupBy tabs */}
            <View style={styles.tabRow}>
              {PERIOD_TABS.map(tab => (
                <TouchableOpacity
                  key={tab.value}
                  style={[styles.tab, groupBy === tab.value && styles.tabActive]}
                  onPress={() => setGroupBy(tab.value)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      groupBy === tab.value && styles.tabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(dashboard?.byPeriod ?? []).length === 0 ? (
              <Empty text={t('dashboard.no_data')} />
            ) : (
              <Card>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chartScroll}
                >
                  <View style={styles.chart}>
                    {(dashboard?.byPeriod ?? []).map((entry, i) => {
                      const incH = Math.max((entry.income / maxNet) * CHART_H, 4);
                      const expH = Math.max((entry.expense / maxNet) * CHART_H, 4);
                      return (
                        <View key={i} style={styles.barGroup}>
                          <View style={styles.bars}>
                            <View
                              style={[
                                styles.bar,
                                { height: incH, backgroundColor: theme.colors.success },
                              ]}
                            />
                            <View
                              style={[
                                styles.bar,
                                { height: expH, backgroundColor: theme.colors.danger },
                              ]}
                            />
                          </View>
                          <Text style={styles.barLabel} numberOfLines={1}>
                            {shortLabel(entry.label, groupBy)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
                <View style={styles.legend}>
                  <LegendDot color={theme.colors.success} label="Income" />
                  <LegendDot color={theme.colors.danger} label="Expense" />
                </View>
              </Card>
            )}
          </Section>

          {/* ── By Category ───────────────────────────────────────────────── */}
          <Section title={t('dashboard.top_categories')}>
            <Card>
              {(dashboard?.byCategory ?? []).length === 0 ? (
                <Empty text={t('dashboard.no_data')} />
              ) : (
                dashboard!.byCategory.map((cat, i) => (
                  <ProgressRow
                    key={cat.category}
                    label={cat.category}
                    amount={cat.totalAmount}
                    count={cat.transactionCount}
                    pct={cat.percentageOfTotal}
                    color={CAT_COLORS[i % CAT_COLORS.length]}
                  />
                ))
              )}
            </Card>
          </Section>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing.l },

  // Header
  header: { paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.m },
  headerTop: { marginBottom: theme.spacing.m },
  welcome: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },

  // Preset pills
  pillRow: { flexDirection: 'row', gap: 8, marginTop: theme.spacing.s },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  pillLabelActive: { color: '#FFF' },

  // Balance card
  balanceCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  balanceCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  balanceCardTotal: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'center',
  },
  actionBtn: {
    minWidth: 140,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statCardValue: { fontSize: 20, fontWeight: '800' },

  // Section
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  empty: { fontSize: 15, color: theme.colors.textSecondary, fontStyle: 'italic', padding: 16, textAlign: 'center' },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 15,
  },

  // GroupBy tabs
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.border,
  },
  tabActive: { backgroundColor: theme.colors.text, borderColor: theme.colors.text },
  tabLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  tabLabelActive: { color: theme.colors.surface },

  // Chart
  chartScroll: { marginBottom: 16 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 8,
    gap: 12,
  },
  barGroup: { alignItems: 'center', width: 40 },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: CHART_H,
  },
  bar: { width: 14, borderRadius: 4 },
  barLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' },

  // Legend
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },

  // Progress rows (category)
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  progressDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  progressBody: { flex: 1 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  progressAmount: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  progressBg: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: 6,
  },
  progressFill: { height: 8, borderRadius: 4 },
  progressMeta: { fontSize: 13, color: theme.colors.textSecondary },
});
