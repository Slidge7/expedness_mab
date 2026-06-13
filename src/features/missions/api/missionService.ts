import apiClient from '../../../api/client';

export interface MissionDTO {
  id?: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  userId?: number;
  clientId?: number | null;
  clientName?: string;
  providerId?: number | null;
  providerName?: string;
}

export const missionService = {
  getAll: async () =>
    (await apiClient.get<MissionDTO[]>('/api/missions/list')).data,

  getById: async (id: number) =>
    (await apiClient.get<MissionDTO>(`/api/missions/get/${id}`)).data,

  create: async (data: MissionDTO) =>
    (await apiClient.post<MissionDTO>('/api/missions/create', data)).data,

  update: async (id: number, data: MissionDTO) =>
    (await apiClient.put<MissionDTO>(`/api/missions/update/${id}`, data)).data,

  delete: async (id: number) => {
    await apiClient.delete(`/api/missions/delete/${id}`);
  },
};
