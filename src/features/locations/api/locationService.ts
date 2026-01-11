import apiClient from '../../../api/client';

export interface LocationDTO {
  id?: number;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const locationService = {
  getAll: async (): Promise<LocationDTO[]> => {
    const response = await apiClient.get<LocationDTO[]>('/api/locations/list');
    return response.data;
  },

  getById: async (id: number): Promise<LocationDTO> => {
    const response = await apiClient.get<LocationDTO>(
      `/api/locations/get/${id}`,
    );
    return response.data;
  },

  create: async (data: LocationDTO): Promise<LocationDTO> => {
    const response = await apiClient.post<LocationDTO>(
      '/api/locations/create',
      data,
    );
    return response.data;
  },

  update: async (id: number, data: LocationDTO): Promise<LocationDTO> => {
    const response = await apiClient.put<LocationDTO>(
      `/api/locations/update/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/locations/delete/${id}`);
  },
};
