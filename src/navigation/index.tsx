import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { LocationListScreen } from '../features/locations/screens/LocationListScreen';

// Redux
import { useAppSelector } from '../store/hooks';
import { theme } from '../theme';
import { CreateLocationScreen } from '../features/locations/screens/CreateLocationScreen';
import { TransactionListScreen } from '../features/transactions/screens/TransactionListScreen';
import { CreateTransactionScreen } from '../features/transactions/screens/CreateTransactionScreen';
import { MissionListScreen } from '../features/missions/api/screens/MissionListScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// This is the "Authenticated" part of the app
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: 'gray',
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTitleStyle: { color: '#fff' },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ title: 'Home' }}
    />
    <Tab.Screen
      options={{ title: 'Missions' }}
      name="Missions"
      component={MissionListScreen}
    />
    <Tab.Screen
      name="Locations"
      component={LocationListScreen}
      options={{ title: 'Locations' }}
    />
    <Tab.Screen
      options={{ title: 'Transactions' }}
      name="Transactions"
      component={TransactionListScreen}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // When logged in, show the Tab System
          <Stack.Group>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="CreateLocation"
              component={CreateLocationScreen}
              options={{
                presentation: 'modal',
                title: 'New Location',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="CreateTransaction"
              component={CreateTransactionScreen}
              options={{ presentation: 'modal' }}
            />
          </Stack.Group>
        ) : (
          // When logged out, show Auth screens
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
