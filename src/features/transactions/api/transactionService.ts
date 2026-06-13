import apiClient from '../../../api/client';

export interface TransactionItemDTO {
  id?: number;
  itemId?: number;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
  category: string;
  reason?: string;
  type: 'INCOME' | 'EXPENSE';
  notes?: string;
}

export interface TransactionDTO {
  id?: number;
  type: 'INCOME' | 'EXPENSE';
  fuelTank?: 'ft1' | 'ft2' | 'ft3';
  category?: string;
  description: string;
  transactionDate: string;
  userId?: number;
  locationId?: number | null;
  missionId?: number | null;
  clientId?: number | null;
  clientName?: string;
  providerId?: number | null;
  providerName?: string;
  totalAmount?: number;
  createdBy?: string;
  createdAt?: string;
  snapBalance?: 'BEFORE' | 'AFTER';
  items: TransactionItemDTO[];
}

const normalizePayload = (data: TransactionDTO): TransactionDTO => ({
  ...data,
  missionId: data.missionId ?? null,
  locationId: data.locationId ?? null,
  clientId: data.clientId ?? null,
  providerId: data.providerId ?? null,
});

export const transactionService = {
  getAll: async () =>
    (await apiClient.get<TransactionDTO[]>('/api/transactions/list')).data,

  getById: async (id: number) =>
    (await apiClient.get<TransactionDTO>(`/api/transactions/get/${id}`)).data,

  create: async (data: TransactionDTO) =>
    (
      await apiClient.post<TransactionDTO>(
        '/api/transactions/create',
        normalizePayload(data),
      )
    ).data,

  update: async (id: number, data: TransactionDTO) =>
    (
      await apiClient.put<TransactionDTO>(
        `/api/transactions/update/${id}`,
        normalizePayload(data),
      )
    ).data,

  delete: async (id: number) =>
    await apiClient.delete(`/api/transactions/delete/${id}`),
};
