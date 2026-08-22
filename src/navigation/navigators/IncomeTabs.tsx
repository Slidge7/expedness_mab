import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TransactionsPanel } from '../../features/transactions/components/TransactionsPanel';
import { ItemListScreen } from '../../features/items/screens/ItemListScreen';
import { ClientsPanel } from '../../features/management/components/ClientsPanel';
import { getBottomTabScreenOptions } from '../headerOptions';
import { useTheme } from '../../theme/ThemeContext';

const Tab = createBottomTabNavigator();

const IncomeTransactionsScreen = () => {
  const isFocused = useIsFocused();
  return <TransactionsPanel type="INCOME" isActive={isFocused} />;
};

const IncomeItemsScreen = () => {
  const isFocused = useIsFocused();
  return <ItemListScreen fixedType="INCOME" isActive={isFocused} />;
};

const IncomeClientsScreen = () => {
  const isFocused = useIsFocused();
  return <ClientsPanel isActive={isFocused} />;
};

export const IncomeTabNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Tab.Navigator screenOptions={getBottomTabScreenOptions(theme)}>
      <Tab.Screen
        name="IncomeTransactions"
        component={IncomeTransactionsScreen}
        options={{
          title: t('section_tabs.transactions'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'}
              size={size + 2}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="IncomeItems"
        component={IncomeItemsScreen}
        options={{
          title: t('section_tabs.items'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="IncomeClients"
        component={IncomeClientsScreen}
        options={{
          title: t('section_tabs.clients'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
