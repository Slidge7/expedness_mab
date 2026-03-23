import apiClient from '../../../api/client';

export interface CategoryDTO {
  id?: number;
  name: string;
  description?: string;
  parents?: string;
  tags?: string;
  code?: string;
  image?: string;
}

export const categoryService = {
  getAll: async () =>
    (await apiClient.get<CategoryDTO[]>('/api/categories/list')).data,

  create: async (data: CategoryDTO) =>
    (await apiClient.post<CategoryDTO>('/api/categories/create', data)).data,
};
