import apiClient from '../../../api/client';

export type Preset = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
export type GroupBy = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface DateRangeParams {
  preset?: Preset;
  from?: string;
  to?: string;
}

// ── Shape mirrors OverviewDTO.Dashboard exactly ───────────────────────────────

export interface BalanceSnapshot {
  ft1: number;
  ft2: number;
  ft3: number;
  total: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  avgAmount: number;
  transactionCount: number;
}

export interface PeriodEntry {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryEntry {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
}

export interface MissionEntry {
  missionId: number;
  missionTitle: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  transactionCount: number;
}

export interface DashboardDTO {
  from: string;
  to: string;
  balance: BalanceSnapshot;
  transactions: TransactionSummary;
  byPeriod: PeriodEntry[];
  byCategory: CategoryEntry[];
  byMission: MissionEntry[];
}

// ── Single call ───────────────────────────────────────────────────────────────

export const overviewService = {
  getDashboard: async (params: DateRangeParams & { groupBy?: GroupBy }) =>
    (await apiClient.get<DashboardDTO>('/api/overview/dashboard', { params }))
      .data,
};
