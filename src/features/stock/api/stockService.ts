import apiClient from '../../../api/client';
import { ItemDTO } from '../../items/api/itemService';

export type StockOperation = 'ADD' | 'REMOVE' | 'SET';

export const stockService = {
  getAll: async (): Promise<ItemDTO[]> => {
    const response = await apiClient.get<ItemDTO[]>('/api/stock/list');
    return response.data;
  },

  getByItem: async (itemId: number): Promise<ItemDTO> => {
    const response = await apiClient.get<ItemDTO>(`/api/stock/item/${itemId}`);
    return response.data;
  },

  enable: async (
    itemId: number,
    initialStock?: number | null,
    minStock?: number | null,
  ): Promise<ItemDTO> => {
    const body: Record<string, number> = {};
    if (initialStock != null) body.initialStock = initialStock;
    if (minStock != null) body.minStock = minStock;
    const response = await apiClient.post<ItemDTO>(
      `/api/stock/enable/${itemId}`,
      Object.keys(body).length > 0 ? body : undefined,
    );
    return response.data;
  },

  disable: async (itemId: number): Promise<ItemDTO> => {
    const response = await apiClient.delete<ItemDTO>(`/api/stock/disable/${itemId}`);
    return response.data;
  },

  adjust: async (
    itemId: number,
    quantity: number,
    operation: StockOperation,
  ): Promise<ItemDTO> => {
    const response = await apiClient.post<ItemDTO>(`/api/stock/adjust/${itemId}`, {
      quantity,
      operation,
    });
    return response.data;
  },
};
