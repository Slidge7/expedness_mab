import { Platform } from 'react-native';
import apiClient from '../../../api/client';

export interface MarqueDTO {
  id?: number;
  title: string;
  description?: string;
  type?: string;
  metadata?: string;
  createdAt?: string;
  createdBy?: string;
  imageSmall?: string | null;
  imageMedium?: string | null;
}

export interface CreateMarqueData {
  title: string;
  description?: string;
  type?: string;
  metadata?: string;
}

function buildMarqueFormData(data: object, imageFile?: any): FormData {
  const formData = new FormData();
  const json = JSON.stringify(data);

  if (Platform.OS === 'web') {
    const jsonBlob = new Blob([json], { type: 'application/json' });
    formData.append('marque', jsonBlob, 'marque.json');

    if (imageFile?.originalFile) {
      formData.append(
        'image',
        imageFile.originalFile,
        imageFile.fileName || 'marque-image.jpg',
      );
    }
  } else {
    const base64 = btoa(unescape(encodeURIComponent(json)));
    formData.append('marque', {
      uri: `data:application/json;base64,${base64}`,
      type: 'application/json',
      name: 'marque.json',
    } as any);

    if (imageFile) {
      formData.append('image', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || 'marque-image.jpg',
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
        imageFile.fileName || 'marque-image.jpg',
      );
    }
  } else {
    formData.append('image', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.fileName || 'marque-image.jpg',
    } as any);
  }

  return formData;
}

export const marqueService = {
  getAll: async (): Promise<MarqueDTO[]> => {
    const response = await apiClient.get<MarqueDTO[]>('/api/marques/list');
    return response.data;
  },

  getById: async (id: number): Promise<MarqueDTO> => {
    const response = await apiClient.get<MarqueDTO>(`/api/marques/get/${id}`);
    return response.data;
  },

  create: async (
    data: CreateMarqueData,
    imageFile?: any,
  ): Promise<MarqueDTO> => {
    const formData = buildMarqueFormData(data, imageFile);
    const response = await apiClient.post<MarqueDTO>(
      '/api/marques/create',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  update: async (
    id: number,
    data: CreateMarqueData,
    imageFile?: any,
  ): Promise<MarqueDTO> => {
    const formData = buildMarqueFormData(data, imageFile);
    const response = await apiClient.put<MarqueDTO>(
      `/api/marques/update/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/marques/delete/${id}`);
  },

  uploadImage: async (id: number, imageFile: any): Promise<MarqueDTO> => {
    const formData = buildImageFormData(imageFile);
    const response = await apiClient.post<MarqueDTO>(
      `/api/marques/${id}/upload-image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  deleteImage: async (id: number): Promise<MarqueDTO> => {
    const response = await apiClient.delete<MarqueDTO>(
      `/api/marques/${id}/delete-image`,
    );
    return response.data;
  },
};
