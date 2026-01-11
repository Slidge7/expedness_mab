import apiClient from '../../../api/client';

export interface TransactionDTO {
  id?: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE'; // Matches your backend enum/logic
  description: string;
  transactionDate: string;
  userId?: number;
  missionId?: number;
  locationId?: number;
}

export const transactionService = {
  getAll: async () =>
    (await apiClient.get<TransactionDTO[]>('/api/transactions/list')).data,
  getById: async (id: number) =>
    (await apiClient.get<TransactionDTO>(`/api/transactions/get/${id}`)).data,
  create: async (data: TransactionDTO) => {
    console.log('data === ', data),
      (await apiClient.post<TransactionDTO>('/api/transactions/create', data))
        .data;
  },
  update: async (id: number, data: TransactionDTO) =>
    (
      await apiClient.put<TransactionDTO>(
        `/api/transactions/update/${id}`,
        data,
      )
    ).data,
  delete: async (id: number) =>
    await apiClient.delete(`/api/transactions/delete/${id}`),
};
