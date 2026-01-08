import axios from 'axios';
import { storage } from '../utils/storage'; // We'll create this next

export const BASE_URL = 'http://192.168.0.105:7001'; // Replace with {{ex_url}}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Auto-attach token
apiClient.interceptors.request.use(
  config => {
    const token = storage.getString('auth.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response Interceptor: Handle 401 (Session Expired)
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Trigger global logout here if needed
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
