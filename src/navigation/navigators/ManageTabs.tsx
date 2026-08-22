import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ClientsPanel } from '../../features/management/components/ClientsPanel';
import { ProvidersPanel } from '../../features/management/components/ProvidersPanel';
import { MissionsPanel } from '../../features/management/components/MissionsPanel';
import { LocationsPanel } from '../../features/management/components/LocationsPanel';
import { getBottomTabScreenOptions } from '../headerOptions';
import { useTheme } from '../../theme/ThemeContext';

const Tab = createBottomTabNavigator();

const ManageClientsScreen = () => {
  const isFocused = useIsFocused();
  return <ClientsPanel isActive={isFocused} />;
};

const ManageProvidersScreen = () => {
  const isFocused = useIsFocused();
  return <ProvidersPanel isActive={isFocused} />;
};

const ManageMissionsScreen = () => {
  const isFocused = useIsFocused();
  return <MissionsPanel isActive={isFocused} />;
};

const ManageLocationsScreen = () => {
  const isFocused = useIsFocused();
  return <LocationsPanel isActive={isFocused} />;
};

export const ManageTabNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Tab.Navigator screenOptions={getBottomTabScreenOptions(theme)}>
      <Tab.Screen
        name="ManageClients"
        component={ManageClientsScreen}
        options={{
          title: t('section_tabs.clients'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageProviders"
        component={ManageProvidersScreen}
        options={{
          title: t('section_tabs.providers'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'business' : 'business-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageMissions"
        component={ManageMissionsScreen}
        options={{
          title: t('management.missions'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'flag' : 'flag-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageLocations"
        component={ManageLocationsScreen}
        options={{
          title: t('management.locations'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'location' : 'location-outline'} size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
