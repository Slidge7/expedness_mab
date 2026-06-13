import apiClient from '../../../api/client';

export interface ClientDTO {
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

export const clientService = {
  getAll: async (): Promise<ClientDTO[]> => {
    const response = await apiClient.get<ClientDTO[]>('/api/clients/list');
    return response.data;
  },

  getById: async (id: number): Promise<ClientDTO> => {
    const response = await apiClient.get<ClientDTO>(`/api/clients/get/${id}`);
    return response.data;
  },

  create: async (data: ClientDTO): Promise<ClientDTO> => {
    const response = await apiClient.post<ClientDTO>('/api/clients/create', data);
    return response.data;
  },

  update: async (id: number, data: ClientDTO): Promise<ClientDTO> => {
    const response = await apiClient.put<ClientDTO>(
      `/api/clients/update/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/clients/delete/${id}`);
  },

  getContacts: async (clientId: number): Promise<ContactDTO[]> => {
    const response = await apiClient.get<ContactDTO[]>(
      `/api/clients/${clientId}/contacts`,
    );
    return response.data;
  },

  createContact: async (
    clientId: number,
    data: ContactDTO,
  ): Promise<ContactDTO> => {
    const response = await apiClient.post<ContactDTO>(
      `/api/clients/${clientId}/contacts`,
      data,
    );
    return response.data;
  },

  updateContact: async (
    clientId: number,
    contactId: number,
    data: ContactDTO,
  ): Promise<ContactDTO> => {
    const response = await apiClient.put<ContactDTO>(
      `/api/clients/${clientId}/contacts/${contactId}`,
      data,
    );
    return response.data;
  },

  deleteContact: async (clientId: number, contactId: number): Promise<void> => {
    await apiClient.delete(`/api/clients/${clientId}/contacts/${contactId}`);
  },
};
