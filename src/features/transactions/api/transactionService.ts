import apiClient from '../../../api/client';

// 1. The Line Item Structure
export interface TransactionItemDTO {
  id?: number; // ID from backend (response only)
  itemId?: number; // ID of existing inventory item (optional)
  itemName?: string; // Name (if creating new or display)
  quantity: number;
  unitPrice: number;
  amount?: number; // Calculated by backend
  category: string;
  reason?: string;
  type: 'INCOME' | 'EXPENSE';
  notes?: string;
}

// 2. The Main Transaction Structure
export interface TransactionDTO {
  id?: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  transactionDate: string;
  userId?: number;
  locationId?: number;
  missionId?: number;
  items: TransactionItemDTO[]; // <-- The new list of items
  totalAmount?: number; // <-- Backend calculates this now
}

export const transactionService = {
  getAll: async () =>
    (await apiClient.get<TransactionDTO[]>('/api/transactions/list')).data,

  create: async (data: TransactionDTO) => {
    console.log(data);
    //   return;
    // We send the exact JSON structure your backend expects
    const response = await apiClient.post<TransactionDTO>(
      '/api/transactions/create',
      data,
    );
    return response.data;
  },

  delete: async (id: number) =>
    await apiClient.delete(`/api/transactions/delete/${id}`),
};
