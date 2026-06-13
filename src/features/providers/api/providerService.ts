import apiClient from '../../../api/client';

export interface ProviderDTO {
  id?: number;
  name: string;
  description?: string;
  company?: string;
  city?: string;
  address?: string;
}

export interface ContactDTO {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  notes?: string;
}

export const providerService = {
  getAll: async (): Promise<ProviderDTO[]> => {
    const response = await apiClient.get<ProviderDTO[]>('/api/providers/list');
    return response.data;
  },

  getById: async (id: number): Promise<ProviderDTO> => {
    const response = await apiClient.get<ProviderDTO>(`/api/providers/get/${id}`);
    return response.data;
  },

  create: async (data: ProviderDTO): Promise<ProviderDTO> => {
    const response = await apiClient.post<ProviderDTO>(
      '/api/providers/create',
      data,
    );
    return response.data;
  },

  update: async (id: number, data: ProviderDTO): Promise<ProviderDTO> => {
    const response = await apiClient.put<ProviderDTO>(
      `/api/providers/update/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/providers/delete/${id}`);
  },

  getContacts: async (providerId: number): Promise<ContactDTO[]> => {
    const response = await apiClient.get<ContactDTO[]>(
      `/api/providers/${providerId}/contacts`,
    );
    return response.data;
  },

  createContact: async (
    providerId: number,
    data: ContactDTO,
  ): Promise<ContactDTO> => {
    const response = await apiClient.post<ContactDTO>(
      `/api/providers/${providerId}/contacts`,
      data,
    );
    return response.data;
  },

  updateContact: async (
    providerId: number,
    contactId: number,
    data: ContactDTO,
  ): Promise<ContactDTO> => {
    const response = await apiClient.put<ContactDTO>(
      `/api/providers/${providerId}/contacts/${contactId}`,
      data,
    );
    return response.data;
  },

  deleteContact: async (
    providerId: number,
    contactId: number,
  ): Promise<void> => {
    await apiClient.delete(
      `/api/providers/${providerId}/contacts/${contactId}`,
    );
  },
};
