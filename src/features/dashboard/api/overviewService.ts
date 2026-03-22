import apiClient from '../../../api/client';

export type Preset = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
export type GroupBy = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface DateRangeParams {
  preset?: Preset;
  from?: string;
  to?: string;
}

export interface CategoryEntry {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
}

export interface SummaryDTO {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  avgTransactionAmount: number;
  transactionCount: number;
  from: string;
  to: string;
  topCategories: CategoryEntry[];
}

export interface PeriodEntry {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface GroupEntry {
  id: number;
  name: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  transactionCount: number;
}

export const overviewService = {
  getSummary: async (params: DateRangeParams & { topN?: number }) =>
    (await apiClient.get<SummaryDTO>('/api/overview/summary', { params })).data,

  getByPeriod: async (params: DateRangeParams & { groupBy?: GroupBy }) =>
    (await apiClient.get<PeriodEntry[]>('/api/overview/by-period', { params }))
      .data,

  getByCategory: async (params: DateRangeParams) =>
    (
      await apiClient.get<CategoryEntry[]>('/api/overview/by-category', {
        params,
      })
    ).data,

  getByMission: async (params: DateRangeParams) =>
    (await apiClient.get<GroupEntry[]>('/api/overview/by-mission', { params }))
      .data,

  getByLocation: async (params: DateRangeParams) =>
    (await apiClient.get<GroupEntry[]>('/api/overview/by-location', { params }))
      .data,
};
