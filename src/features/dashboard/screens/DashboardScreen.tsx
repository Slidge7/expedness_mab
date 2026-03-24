import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDashboard } from '../../../store/overviewSlice';
import { theme } from '../../../theme';
import { Preset, GroupBy } from '../api/overviewService';

// ── Constants ──────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');

const PRESETS: { label: string; value: Preset }[] = [
  { label: 'Today', value: 'TODAY' },
  { label: 'Week', value: 'THIS_WEEK' },
  { label: 'Month', value: 'THIS_MONTH' },
];

const PERIOD_TABS: { label: string; value: GroupBy }[] = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
];

const CAT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const TAG_COLORS = ['#06B6D4', '#F97316', '#84CC16', '#EC4899', '#14B8A6'];
const FT_COLORS = { ft1: '#6366F1', ft2: '#10B981', ft3: '#F59E0B' };
const INCOME_CLR = '#10B981';
const EXPENSE_CLR = '#EF4444';
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
  const dispatch = useAppDispatch();
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

  // ── Balance ft totals for proportional bars ─────────────────────────────────
  const ftTotal = (bal?.ft1 ?? 0) + (bal?.ft2 ?? 0) + (bal?.ft3 ?? 0) || 1;

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
        <Text style={styles.welcome}>Hello, {user?.username} 👋</Text>

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
        <>
          {/* ── Balance Card ──────────────────────────────────────────────── */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceCardLabel}>Current Balance</Text>
            <Text style={styles.balanceCardTotal}>${fmt(bal?.total ?? 0)}</Text>

            {/* ft1 / ft2 / ft3 breakdown */}
            <View style={styles.ftRow}>
              {(['ft1', 'ft2', 'ft3'] as const).map(key => (
                <View key={key} style={styles.ftBox}>
                  <View
                    style={[styles.ftDot, { backgroundColor: FT_COLORS[key] }]}
                  />
                  <Text style={styles.ftKey}>{key.toUpperCase()}</Text>
                  <Text style={styles.ftVal}>${fmt(bal?.[key] ?? 0)}</Text>
                </View>
              ))}
            </View>

            {/* Proportional bar */}
            <View style={styles.ftBar}>
              {(['ft1', 'ft2', 'ft3'] as const).map(key => (
                <View
                  key={key}
                  style={[
                    styles.ftBarSegment,
                    {
                      flex: (bal?.[key] ?? 0) / ftTotal,
                      backgroundColor: FT_COLORS[key],
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* ── Income / Expense / Net ─────────────────────────────────────── */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderTopColor: INCOME_CLR }]}>
              <Text style={styles.statCardLabel}>Income</Text>
              <Text style={[styles.statCardValue, { color: INCOME_CLR }]}>
                ${fmt(txn?.totalIncome)}
              </Text>
            </View>
            <View style={[styles.statCard, { borderTopColor: EXPENSE_CLR }]}>
              <Text style={styles.statCardLabel}>Expense</Text>
              <Text style={[styles.statCardValue, { color: EXPENSE_CLR }]}>
                ${fmt(txn?.totalExpense)}
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                {
                  borderTopColor:
                    (txn?.net ?? 0) >= 0 ? INCOME_CLR : EXPENSE_CLR,
                },
              ]}
            >
              <Text style={styles.statCardLabel}>Net</Text>
              <Text
                style={[
                  styles.statCardValue,
                  {
                    color: (txn?.net ?? 0) >= 0 ? INCOME_CLR : EXPENSE_CLR,
                  },
                ]}
              >
                {(txn?.net ?? 0) < 0 ? '-' : ''}${fmt(Math.abs(txn?.net ?? 0))}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statCardLabel}>Avg.</Text>
              <Text style={styles.statCardValue}>${fmt(txn?.avgAmount)}</Text>
            </View>
          </View>

          {/* ── Period Chart ───────────────────────────────────────────────── */}
          <Section title="Over Time">
            {/* GroupBy tabs */}
            <View style={styles.tabRow}>
              {PERIOD_TABS.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.tab, groupBy === t.value && styles.tabActive]}
                  onPress={() => setGroupBy(t.value)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      groupBy === t.value && styles.tabLabelActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(dashboard?.byPeriod ?? []).length === 0 ? (
              <Empty />
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chartScroll}
                >
                  <View style={styles.chart}>
                    {(dashboard?.byPeriod ?? []).map((entry, i) => {
                      const incH = Math.max(
                        (entry.income / maxNet) * CHART_H,
                        3,
                      );
                      const expH = Math.max(
                        (entry.expense / maxNet) * CHART_H,
                        3,
                      );
                      return (
                        <View key={i} style={styles.barGroup}>
                          <View style={styles.bars}>
                            <View
                              style={[
                                styles.bar,
                                { height: incH, backgroundColor: INCOME_CLR },
                              ]}
                            />
                            <View
                              style={[
                                styles.bar,
                                { height: expH, backgroundColor: EXPENSE_CLR },
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
                  <LegendDot color={INCOME_CLR} label="Income" />
                  <LegendDot color={EXPENSE_CLR} label="Expense" />
                </View>
              </>
            )}
          </Section>

          {/* ── By Category ───────────────────────────────────────────────── */}
          <Section title="By Category">
            {(dashboard?.byCategory ?? []).length === 0 ? (
              <Empty />
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
          </Section>

          {/* ── By Mission ────────────────────────────────────────────────── */}
          <Section title="By Mission">
            {(dashboard?.byMission ?? []).length === 0 ? (
              <Empty />
            ) : (
              dashboard!.byMission.map(m => (
                <View key={m.missionId} style={styles.missionRow}>
                  <View style={styles.missionLeft}>
                    <Text style={styles.missionTitle} numberOfLines={1}>
                      {m.missionTitle}
                    </Text>
                    <Text style={styles.missionCount}>
                      {m.transactionCount} transactions
                    </Text>
                  </View>
                  <View style={styles.missionRight}>
                    <Text style={[styles.missionIncome]}>
                      +${fmt(m.totalIncome)}
                    </Text>
                    <Text style={[styles.missionExpense]}>
                      -${fmt(m.totalExpense)}
                    </Text>
                    <Text
                      style={[
                        styles.missionNet,
                        { color: m.net >= 0 ? INCOME_CLR : EXPENSE_CLR },
                      ]}
                    >
                      {m.net >= 0 ? '+' : ''}
                      {fmt(m.net)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Section>
        </>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Empty = () => <Text style={styles.empty}>No data for this period</Text>;

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const ProgressRow = ({
  label,
  amount,
  count,
  pct,
  color,
}: {
  label: string;
  amount: number;
  count: number;
  pct: number;
  color: string;
}) => (
  <View style={styles.progressRow}>
    <View style={[styles.progressDot, { backgroundColor: color }]} />
    <View style={styles.progressBody}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.progressAmount}>${fmt(amount)}</Text>
      </View>
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%` as any, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.progressMeta}>
        {count} txn · {pct.toFixed(1)}%
      </Text>
    </View>
  </View>
);

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F14' },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F1F1F3',
    marginBottom: 16,
  },

  // Preset pills
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1C1C26',
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillLabel: { fontSize: 13, fontWeight: '600', color: '#888' },
  pillLabelActive: { color: '#FFF' },

  // Balance card
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#1A1A28',
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  balanceCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  balanceCardTotal: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F1F1F3',
    marginBottom: 20,
  },
  ftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ftBox: { alignItems: 'center', flex: 1 },
  ftDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  ftKey: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  ftVal: { fontSize: 14, fontWeight: '700', color: '#D1D1DB' },
  ftBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#2A2A3A',
  },
  ftBarSegment: { height: 6 },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_W - 56) / 2,
    backgroundColor: '#1A1A28',
    borderRadius: 14,
    padding: 14,
    borderTopWidth: 3,
    borderTopColor: '#2A2A3A',
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statCardValue: { fontSize: 18, fontWeight: '800', color: '#F1F1F3' },

  // Section
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F1F3',
    marginBottom: 14,
  },
  empty: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  errorText: {
    color: EXPENSE_CLR,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
  },

  // GroupBy tabs
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1C1C26',
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  tabActive: { backgroundColor: '#2A2A3A', borderColor: '#444' },
  tabLabel: { fontSize: 12, fontWeight: '600', color: '#555' },
  tabLabelActive: { color: '#F1F1F3' },

  // Chart
  chartScroll: { marginBottom: 10 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 4,
    gap: 6,
  },
  barGroup: { alignItems: 'center', width: 32 },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: CHART_H,
  },
  bar: { width: 12, borderRadius: 3 },
  barLabel: { fontSize: 9, color: '#555', marginTop: 5, textAlign: 'center' },

  // Legend
  legend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: '#888' },

  // Progress rows (category + tag)
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  progressDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  progressBody: { flex: 1 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D1DB',
    flex: 1,
    marginRight: 8,
  },
  progressAmount: { fontSize: 14, fontWeight: '700', color: '#F1F1F3' },
  progressBg: {
    height: 5,
    backgroundColor: '#2A2A3A',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: { height: 5, borderRadius: 3 },
  progressMeta: { fontSize: 11, color: '#555' },

  // Mission rows
  missionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C26',
  },
  missionLeft: { flex: 1, marginRight: 12 },
  missionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D1D1DB',
    marginBottom: 3,
  },
  missionCount: { fontSize: 11, color: '#555' },
  missionRight: { alignItems: 'flex-end' },
  missionIncome: { fontSize: 12, color: INCOME_CLR, fontWeight: '600' },
  missionExpense: { fontSize: 12, color: EXPENSE_CLR, fontWeight: '600' },
  missionNet: { fontSize: 13, fontWeight: '800', marginTop: 2 },
});
