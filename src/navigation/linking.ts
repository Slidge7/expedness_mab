import { getStateFromPath as getStateFromPathDefault } from '@react-navigation/native';
import { PUBLIC_BASE_URL } from '../features/catalog/api/catalogService';
import { WEB_BASE_URL } from '../config';

export const linkingPrefixes = [PUBLIC_BASE_URL, WEB_BASE_URL];

export const linkingConfig = {
  screens: {
    Main: {
      path: '',
      screens: {
        Home: '',
        Dashboard: 'dashboard',
        Income: {
          path: 'income',
          screens: {
            IncomeTransactions: 'transactions',
            IncomeItems: 'items',
            IncomeClients: 'clients',
          },
        },
        Expense: {
          path: 'expense',
          screens: {
            ExpenseTransactions: 'transactions',
            ExpenseItems: 'items',
            ExpenseProviders: 'providers',
          },
        },
        Items: {
          path: 'items',
          screens: {
            ItemsList: '',
            ItemsStock: 'stock',
            ItemsMarques: 'marques',
            ItemsCategories: 'categories',
          },
        },
        Catalog: 'catalog',
        Manage: {
          path: 'manage',
          screens: {
            ManageClients: 'clients',
            ManageProviders: 'providers',
            ManageMissions: 'missions',
            ManageLocations: 'locations',
          },
        },
        Setting: 'settings',
      },
    },
    Login: 'login',
    Register: 'register',
    PublicCatalog: 'catalog/:token',
    Management: 'management',
  },
};

export const linking = {
  prefixes: linkingPrefixes,
  config: linkingConfig,
  getStateFromPath(path: string, options: Parameters<typeof getStateFromPathDefault>[1]) {
    const normalized = path.split('?')[0].replace(/^\//, '');

    if (normalized === '') {
      return undefined;
    }

    if (normalized.startsWith('catalog/')) {
      const token = decodeURIComponent(normalized.slice('catalog/'.length));
      if (!token || token === 'undefined') {
        return undefined;
      }
      return {
        routes: [{ name: 'PublicCatalog', params: { token } }],
      };
    }

    return getStateFromPathDefault(path, options);
  },
};
