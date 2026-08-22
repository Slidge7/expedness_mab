import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TransactionsPanel } from '../../features/transactions/components/TransactionsPanel';
import { ItemListScreen } from '../../features/items/screens/ItemListScreen';
import { ProvidersPanel } from '../../features/management/components/ProvidersPanel';
import { getBottomTabScreenOptions } from '../headerOptions';
import { useTheme } from '../../theme/ThemeContext';

const Tab = createBottomTabNavigator();

const ExpenseTransactionsScreen = () => {
  const isFocused = useIsFocused();
  return <TransactionsPanel type="EXPENSE" isActive={isFocused} />;
};

const ExpenseItemsScreen = () => {
  const isFocused = useIsFocused();
  return <ItemListScreen fixedType="EXPENSE" isActive={isFocused} />;
};

const ExpenseProvidersScreen = () => {
  const isFocused = useIsFocused();
  return <ProvidersPanel isActive={isFocused} />;
};

export const ExpenseTabNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Tab.Navigator screenOptions={getBottomTabScreenOptions(theme)}>
      <Tab.Screen
        name="ExpenseTransactions"
        component={ExpenseTransactionsScreen}
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
        name="ExpenseItems"
        component={ExpenseItemsScreen}
        options={{
          title: t('section_tabs.items'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExpenseProviders"
        component={ExpenseProvidersScreen}
        options={{
          title: t('section_tabs.providers'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'business' : 'business-outline'} size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
