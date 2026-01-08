import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
// import { RegisterScreen } from '../features/auth/screens/RegisterScreen'; // Create this later based on LoginScreen
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  // Select only the isAuthenticated state to prevent unnecessary re-renders
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // ─── App Stack ───
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          // ─── Auth Stack ───
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* Add RegisterScreen here later */}
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
