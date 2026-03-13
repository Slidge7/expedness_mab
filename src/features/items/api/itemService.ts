import apiClient from '../../../api/client';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface ItemDTO {
  id?: number;
  name: string;
  description?: string;
  unitPrice: number;
  category?: string;
  type: TransactionType;
  unit?: string;
  active: boolean;
  createdAt?: string;
  createdBy?: string;
  imageSmall?: string | null; // Base64 string
  imageMedium?: string | null; // Base64 string
}

export interface CreateItemData {
  name: string;
  description?: string;
  unitPrice: number;
  category?: string;
  type: TransactionType;
  unit?: string;
  active: boolean;
}

export const itemService = {
  getAll: async () => (await apiClient.get<ItemDTO[]>('/api/items/list')).data,

  getActive: async () =>
    (await apiClient.get<ItemDTO[]>('/api/items/active')).data,

  getByType: async (type: TransactionType) =>
    (await apiClient.get<ItemDTO[]>(`/api/items/type/${type}`)).data,

  getById: async (id: number) =>
    (await apiClient.get<ItemDTO>(`/api/items/get/${id}`)).data,

  create: async (data: CreateItemData) =>
    (await apiClient.post<ItemDTO>('/api/items/create', data)).data,

  update: async (id: number, data: CreateItemData) =>
    (await apiClient.put<ItemDTO>(`/api/items/update/${id}`, data)).data,

  delete: async (id: number) =>
    await apiClient.delete(`/api/items/delete/${id}`),

  /**
   * Upload image for an item
   *
   * @param id Item ID
   * @param imageUri URI of the image file (e.g., from react-native-image-picker)
   * @returns Updated ItemDTO with the new image
   */
  uploadImage: async (id: number, imageUri: string) => {
    try {
      console.log(`[uploadImage] Starting upload for item ${id}`);
      console.log(`[uploadImage] Image URI: ${imageUri}`);

      // Create FormData for multipart request
      const formData = new FormData();

      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'image.jpg';

      // Append image file
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg', // Adjust based on image type if needed
        name: filename,
      } as any);

      console.log(`[uploadImage] FormData prepared with file: ${filename}`);

      // Make POST request with FormData
      // The interceptor will handle JWT token and Content-Type
      const response = await apiClient.post<ItemDTO>(
        `/api/items/${id}/upload-image`,
        formData,
      );

      console.log(`[uploadImage] Success! Item ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error(
        `[uploadImage] Error uploading image for item ${id}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Delete image for an item
   *
   * @param id Item ID
   * @returns Updated ItemDTO without image
   */
  deleteImage: async (id: number) => {
    try {
      console.log(`[deleteImage] Deleting image for item ${id}`);

      const response = await apiClient.delete<ItemDTO>(
        `/api/items/${id}/delete-image`,
      );

      console.log(`[deleteImage] Success! Image deleted for item ${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `[deleteImage] Error deleting image for item ${id}:`,
        error,
      );
      throw error;
    }
  },
};
