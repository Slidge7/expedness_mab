import apiClient from '../../../api/client';

export interface MissionDTO {
  id?: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  userId?: number;
}

export const missionService = {
  getAll: async () =>
    (await apiClient.get<MissionDTO[]>('/api/missions/list')).data,
  create: async (data: MissionDTO) =>
    (await apiClient.post<MissionDTO>('/api/missions/create', data)).data,
};
