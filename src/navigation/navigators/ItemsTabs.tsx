import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ItemListScreen } from '../../features/items/screens/ItemListScreen';
import { StockListScreen } from '../../features/stock/screens/StockListScreen';
import { MarquesPanel } from '../../features/management/components/MarquesPanel';
import { CategoriesPanel } from '../../features/management/components/CategoriesPanel';
import { getBottomTabScreenOptions } from '../headerOptions';
import { useTheme } from '../../theme/ThemeContext';

const Tab = createBottomTabNavigator();

const ItemsListTabScreen = () => {
  const isFocused = useIsFocused();
  return <ItemListScreen isActive={isFocused} showMarqueCategoryFilters />;
};

const ItemsMarquesScreen = () => {
  const isFocused = useIsFocused();
  return <MarquesPanel isActive={isFocused} />;
};

const ItemsCategoriesScreen = () => {
  const isFocused = useIsFocused();
  return <CategoriesPanel isActive={isFocused} />;
};

export const ItemsTabNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Tab.Navigator screenOptions={getBottomTabScreenOptions(theme)}>
      <Tab.Screen
        name="ItemsList"
        component={ItemsListTabScreen}
        options={{
          title: t('section_tabs.items'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ItemsStock"
        component={StockListScreen}
        options={{
          title: t('nav.stock'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'layers' : 'layers-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ItemsMarques"
        component={ItemsMarquesScreen}
        options={{
          title: t('management.marques'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'pricetag' : 'pricetag-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ItemsCategories"
        component={ItemsCategoriesScreen}
        options={{
          title: t('management.categories'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'folder' : 'folder-outline'} size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
