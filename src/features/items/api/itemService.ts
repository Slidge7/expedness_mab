import apiClient from '../../../api/client';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface ItemDTO {
  id?: number;
  name: string;
  description?: string;
  unitPrice: number;
  category?: string;
  type: TransactionType; // Matches your Java Enum
  unit?: string; // e.g., "kg", "pcs", "hours"
  active: boolean;
}

export const itemService = {
  getAll: async () => (await apiClient.get<ItemDTO[]>('/api/items/list')).data,

  getActive: async () =>
    (await apiClient.get<ItemDTO[]>('/api/items/active')).data,

  getByType: async (type: TransactionType) =>
    (await apiClient.get<ItemDTO[]>(`/api/items/type/${type}`)).data,

  getById: async (id: number) =>
    (await apiClient.get<ItemDTO>(`/api/items/get/${id}`)).data,

  create: async (data: ItemDTO) =>
    (await apiClient.post<ItemDTO>('/api/items/create', data)).data,

  update: async (id: number, data: ItemDTO) =>
    (await apiClient.put<ItemDTO>(`/api/items/update/${id}`, data)).data,

  delete: async (id: number) =>
    await apiClient.delete(`/api/items/delete/${id}`),
};
