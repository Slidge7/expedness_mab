import { Platform } from 'react-native';

export const API_BASE_URL = __DEV__
  ? 'http://localhost:7001'
  : 'https://api.expedness.com';

export const WEB_BASE_URL =
  Platform.OS === 'web'
    ? (globalThis as typeof globalThis & { location?: { origin: string } }).location
        ?.origin ?? 'http://localhost:3000'
    : 'http://localhost:3000';
