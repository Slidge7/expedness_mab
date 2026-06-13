import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://localhost:7001';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  // NO global Content-Type header
});

apiClient.interceptors.request.use(
  async config => {
    // Add JWT token
    const token = await AsyncStorage.getItem('auth.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CRITICAL: If Content-Type is undefined, delete it
    // This lets Axios auto-set it for FormData
    if (config.headers['Content-Type'] === undefined) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  error => Promise.reject(error),
);

export default apiClient;
