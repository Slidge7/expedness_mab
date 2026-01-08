import apiClient from '../../../api/client';
import { AuthResponse } from '../types';
import { LoginPayload, RegisterPayload } from './types';

export const authService = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/login',
      data,
    );
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register',
      data,
    );
    return response.data;
  },
};
