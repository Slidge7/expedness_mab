import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchSummary, fetchByPeriod } from '../../../store/overviewSlice';
import { theme } from '../../../theme';
import { Preset, GroupBy } from '../api/overviewService';

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

const CATEGORY_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const DashboardScreen = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { summary, periodEntries, loading } = useAppSelector(
    state => state.overview,
  );

  const [preset, setPreset] = useState<Preset>('THIS_MONTH');
  const [groupBy, setGroupBy] = useState<GroupBy>('DAILY');

  useEffect(() => {
    dispatch(fetchSummary({ preset, topN: 3 }));
    dispatch(fetchByPeriod({ preset, groupBy }));
  }, [preset, groupBy, dispatch]);

  const fmt = (n: number) =>
    n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const maxPeriodNet = Math.max(...periodEntries.map(e => Math.abs(e.net)), 1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Hello, {user?.username} 👋</Text>

        {/* Preset tabs */}
        <View style={styles.presetRow}>
          {PRESETS.map(p => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.presetBtn,
                preset === p.value && styles.presetBtnActive,
              ]}
              onPress={() => setPreset(p.value)}
            >
              <Text
                style={[
                  styles.presetLabel,
                  preset === p.value && styles.presetLabelActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance</Text>
          {loading && !summary ? (
            <ActivityIndicator color="#FFF" style={{ marginTop: 8 }} />
          ) : (
            <Text
              style={[
                styles.balanceAmount,
                { color: (summary?.balance ?? 0) >= 0 ? '#FFF' : '#FECACA' },
              ]}
            >
              {(summary?.balance ?? 0) >= 0 ? '' : '-'}$
              {fmt(Math.abs(summary?.balance ?? 0))}
            </Text>
          )}
        </View>
      </View>

      {/* ── Income / Expense row ── */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statBox,
            { borderLeftColor: '#10B981', borderLeftWidth: 4 },
          ]}
        >
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            ${fmt(summary?.totalIncome ?? 0)}
          </Text>
        </View>
        <View
          style={[
            styles.statBox,
            { borderLeftColor: '#EF4444', borderLeftWidth: 4 },
          ]}
        >
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            ${fmt(summary?.totalExpense ?? 0)}
          </Text>
        </View>
      </View>

      {/* ── Extra stats ── */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Transactions</Text>
          <Text style={styles.statValue}>{summary?.transactionCount ?? 0}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Avg. Transaction</Text>
          <Text style={styles.statValue}>
            ${fmt(summary?.avgTransactionAmount ?? 0)}
          </Text>
        </View>
      </View>

      {/* ── Top Categories ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Categories</Text>
        {(summary?.topCategories ?? []).length === 0 ? (
          <Text style={styles.empty}>No data for this period</Text>
        ) : (
          summary?.topCategories.map((cat, i) => (
            <View key={cat.category} style={styles.categoryRow}>
              <View
                style={[
                  styles.categoryDot,
                  {
                    backgroundColor:
                      CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                  },
                ]}
              />
              <View style={styles.categoryInfo}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{cat.category}</Text>
                  <Text style={styles.categoryAmount}>
                    ${fmt(cat.totalAmount)}
                  </Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${cat.percentageOfTotal}%` as any,
                        backgroundColor:
                          CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryPct}>
                  {cat.percentageOfTotal.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* ── Period Chart ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Spending Over Time</Text>
          <View style={styles.periodTabRow}>
            {PERIOD_TABS.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.periodTab,
                  groupBy === t.value && styles.periodTabActive,
                ]}
                onPress={() => setGroupBy(t.value)}
              >
                <Text
                  style={[
                    styles.periodTabLabel,
                    groupBy === t.value && styles.periodTabLabelActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginTop: 16 }}
          />
        ) : periodEntries.length === 0 ? (
          <Text style={styles.empty}>No data for this period</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chartScroll}
          >
            <View style={styles.chart}>
              {periodEntries.map((entry, i) => {
                const incomeH = Math.max(
                  (entry.income / maxPeriodNet) * 100,
                  2,
                );
                const expenseH = Math.max(
                  (entry.expense / maxPeriodNet) * 100,
                  2,
                );
                return (
                  <View key={i} style={styles.barGroup}>
                    <View style={styles.bars}>
                      <View
                        style={[
                          styles.bar,
                          { height: incomeH, backgroundColor: '#10B981' },
                        ]}
                      />
                      <View
                        style={[
                          styles.bar,
                          { height: expenseH, backgroundColor: '#EF4444' },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel} numberOfLines={1}>
                      {entry.label.length > 6
                        ? entry.label.slice(5)
                        : entry.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendLabel}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendLabel}>Expense</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    backgroundColor: theme.colors.primary,
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcome: { color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 14 },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  presetBtnActive: { backgroundColor: '#FFF' },
  presetLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  presetLabelActive: { color: theme.colors.primary, fontWeight: '700' },
  balanceCard: { marginTop: 4 },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  balanceAmount: { fontSize: 38, fontWeight: '800', marginTop: 4 },

  // Stat rows
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  statLabel: { color: '#64748B', fontSize: 12, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1E293B' },

  // Section
  section: {
    margin: 16,
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  empty: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Categories
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 10,
  },
  categoryInfo: { flex: 1 },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  categoryAmount: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  progressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },
  categoryPct: { fontSize: 11, color: '#94A3B8', marginTop: 3 },

  // Period chart
  periodTabRow: { flexDirection: 'row', gap: 6 },
  periodTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  periodTabActive: { backgroundColor: theme.colors.primary },
  periodTabLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  periodTabLabelActive: { color: '#FFF', fontWeight: '700' },
  chartScroll: { marginBottom: 12 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 8,
    minHeight: 120,
  },
  barGroup: { alignItems: 'center', width: 36 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 100 },
  bar: { width: 14, borderRadius: 4, minHeight: 2 },
  barLabel: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 4,
    width: 36,
    textAlign: 'center',
  },
  legend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: '#64748B' },
});
