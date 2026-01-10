import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';

// REDUX IMPORTS
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  // Select Auth status directly from Redux Store
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Protected Routes
          <Stack.Group>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
          </Stack.Group>
        ) : (
          // Public Routes
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
