import axios from 'axios';
import apiClient, { BASE_URL } from '../../../api/client';

export type ContactType = 'WHATSAPP' | 'TELEGRAM' | 'MESSENGER';
export type CatalogOrderStatus = 'PENDING' | 'VIEWED' | 'COMPLETED';

export interface CatalogDTO {
  id?: number;
  name: string;
  description?: string;
  token?: string;
  active?: boolean;
  contactType: ContactType;
  contactValue: string;
  itemIds?: number[];
  itemNames?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCatalogData {
  name: string;
  description?: string;
  active?: boolean;
  contactType: ContactType;
  contactValue: string;
  itemIds: number[];
}

export interface PublicItemDTO {
  id: number;
  name: string;
  description?: string;
  unitPrice: number;
  unit?: string;
  imageSmall?: string | null;
  category?: string;
  marqueId?: number | null;
  marqueTitle?: string | null;
}

export interface PublicCatalogDTO {
  token: string;
  name: string;
  description?: string;
  items: PublicItemDTO[];
}

export interface OrderLineRequest {
  itemId: number;
  quantity: number;
}

export interface SubmitOrderRequest {
  clientName: string;
  clientNote?: string;
  lines: OrderLineRequest[];
}

export interface SubmitOrderResponse {
  contactType: ContactType;
  contactValue: string;
  orderSummary: string;
  orderId: number;
}

export interface CatalogOrderItemDTO {
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CatalogOrderDTO {
  id: number;
  catalogId: number;
  catalogName: string;
  clientName: string;
  clientNote?: string;
  clientId: number | null;
  transactionId: number | null;
  status: CatalogOrderStatus;
  submittedAt: string;
  totalAmount: number;
  items: CatalogOrderItemDTO[];
}

/** Frontend URL for shareable catalog links (web dev server). */
export const PUBLIC_BASE_URL =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'http://localhost:3000';

export const buildCatalogShareUrl = (token: string) =>
  `${PUBLIC_BASE_URL}/catalog/${token}`;

const publicApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const catalogService = {
  getAll: async () =>
    (await apiClient.get<CatalogDTO[]>('/api/catalogs/list')).data,

  getById: async (id: number) =>
    (await apiClient.get<CatalogDTO>(`/api/catalogs/get/${id}`)).data,

  create: async (data: CreateCatalogData) =>
    (await apiClient.post<CatalogDTO>('/api/catalogs/create', data)).data,

  update: async (id: number, data: CreateCatalogData) =>
    (await apiClient.put<CatalogDTO>(`/api/catalogs/update/${id}`, data)).data,

  delete: async (id: number) =>
    await apiClient.delete(`/api/catalogs/delete/${id}`),

  getOrders: async (catalogId: number) =>
    (await apiClient.get<CatalogOrderDTO[]>(`/api/catalogs/${catalogId}/orders`)).data,

  updateOrderStatus: async (orderId: number, status: CatalogOrderStatus) =>
    (
      await apiClient.put<CatalogOrderDTO>(
        `/api/catalogs/orders/${orderId}/status`,
        { status },
      )
    ).data,

  getPublicCatalog: async (token: string) =>
    (await publicApiClient.get<PublicCatalogDTO>(`/api/public/catalog/${token}`)).data,

  submitPublicOrder: async (token: string, data: SubmitOrderRequest) =>
    (
      await publicApiClient.post<SubmitOrderResponse>(
        `/api/public/catalog/${token}/order`,
        data,
      )
    ).data,
};
