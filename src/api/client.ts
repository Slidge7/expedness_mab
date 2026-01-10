import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://192.168.11.106:7001';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  async config => {
    // FIX: Use AsyncStorage directly and await it
    const token = await AsyncStorage.getItem('auth.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Add logging so you can see what's happening in your terminal/flipper
apiClient.interceptors.response.use(
  response => {
    console.log(
      `[API Success] ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
    );
    return response;
  },
  error => {
    console.error(
      `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

export default apiClient;
