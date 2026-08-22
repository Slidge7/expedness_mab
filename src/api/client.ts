import axios from 'axios';
import { API_BASE_URL } from '../config';

export const BASE_URL = API_BASE_URL;

let cachedToken: string | null = null;

export function setApiToken(token: string | null) {
  cachedToken = token;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  // NO global Content-Type header
});

apiClient.interceptors.request.use(
  config => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
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
