import { Platform } from 'react-native';
import apiClient from '../../../api/client';

export interface CategoryDTO {
  id?: number;
  name: string;
  description?: string;
  parents?: string;
  tags?: string;
  code?: string;
  categoryType?: string;
  imageSmall?: string | null;
  imageMedium?: string | null;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parents?: string;
  tags?: string;
  code?: string;
  categoryType?: string;
}

function buildCategoryFormData(data: object, imageFile?: any): FormData {
  const formData = new FormData();
  const json = JSON.stringify(data);

  if (Platform.OS === 'web') {
    const jsonBlob = new Blob([json], { type: 'application/json' });
    formData.append('category', jsonBlob, 'category.json');

    if (imageFile?.originalFile) {
      formData.append(
        'image',
        imageFile.originalFile,
        imageFile.fileName || 'category-image.jpg',
      );
    }
  } else {
    const base64 = btoa(unescape(encodeURIComponent(json)));
    formData.append('category', {
      uri: `data:application/json;base64,${base64}`,
      type: 'application/json',
      name: 'category.json',
    } as any);

    if (imageFile) {
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || 'category-image.jpg',
      } as any);
    }
  }

  return formData;
}

function buildImageFormData(imageFile: any): FormData {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    if (imageFile.originalFile) {
      formData.append(
        'image',
        imageFile.originalFile,
        imageFile.fileName || 'category-image.jpg',
      );
    }
  } else {
    formData.append('image', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.fileName || 'category-image.jpg',
    } as any);
  }

  return formData;
}

export const categoryService = {
  getAll: async (): Promise<CategoryDTO[]> => {
    const response = await apiClient.get<CategoryDTO[]>('/api/categories/list');
    return response.data;
  },

  getByType: async (categoryType: string): Promise<CategoryDTO[]> => {
    const response = await apiClient.get<CategoryDTO[]>(
      `/api/categories/type/${encodeURIComponent(categoryType)}`,
    );
    return response.data;
  },

  getById: async (id: number): Promise<CategoryDTO> => {
    const response = await apiClient.get<CategoryDTO>(`/api/categories/get/${id}`);
    return response.data;
  },

  create: async (
    data: CreateCategoryData,
    imageFile?: any,
  ): Promise<CategoryDTO> => {
    const formData = buildCategoryFormData(data, imageFile);
    const response = await apiClient.post<CategoryDTO>(
      '/api/categories/create',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  update: async (
    id: number,
    data: CreateCategoryData,
    imageFile?: any,
  ): Promise<CategoryDTO> => {
    const formData = buildCategoryFormData(data, imageFile);
    const response = await apiClient.put<CategoryDTO>(
      `/api/categories/update/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/categories/delete/${id}`);
  },

  uploadImage: async (id: number, imageFile: any): Promise<CategoryDTO> => {
    const formData = buildImageFormData(imageFile);
    const response = await apiClient.post<CategoryDTO>(
      `/api/categories/${id}/upload-image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  deleteImage: async (id: number): Promise<CategoryDTO> => {
    const response = await apiClient.delete<CategoryDTO>(
      `/api/categories/${id}/delete-image`,
    );
    return response.data;
  },
};
