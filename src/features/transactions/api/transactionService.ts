import apiClient from '../../../api/client';

export type DiscountType = 'PERCENT' | 'FIXED';

export interface TransactionItemDTO {
  id?: number;
  itemId?: number;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  amount?: number;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountAmount?: number;
  category?: string;
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
  subtotal?: number;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountAmount?: number;
  totalAmount?: number;
  createdBy?: string;
  createdAt?: string;
  snapBalance?: 'BEFORE' | 'AFTER';
  items: TransactionItemDTO[];
}

const cleanDiscountFields = <
  T extends { discountType?: DiscountType | null; discountValue?: number | null },
>(
  obj: T,
): T => {
  const cleaned = { ...obj };
  if (!cleaned.discountType || cleaned.discountValue == null) {
    delete cleaned.discountType;
    delete cleaned.discountValue;
  }
  return cleaned;
};

const cleanLineItem = (item: TransactionItemDTO): TransactionItemDTO => {
  const {
    subtotal,
    amount,
    discountAmount,
    itemName,
    id,
    ...rest
  } = item;
  return cleanDiscountFields(rest);
};

const normalizePayload = (data: TransactionDTO): TransactionDTO => {
  const payload = cleanDiscountFields({
    ...data,
    missionId: data.missionId ?? null,
    locationId: data.locationId ?? null,
    clientId: data.clientId ?? null,
    providerId: data.providerId ?? null,
    items: data.items.map(cleanLineItem),
  });

  delete payload.subtotal;
  delete payload.discountAmount;
  delete payload.totalAmount;

  return payload;
};

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
