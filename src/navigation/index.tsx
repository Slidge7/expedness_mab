import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { LocationListScreen } from '../features/locations/screens/LocationListScreen';
import { CreateLocationScreen } from '../features/locations/screens/CreateLocationScreen';
import { TransactionListScreen } from '../features/transactions/screens/TransactionListScreen';
import { CreateTransactionScreen } from '../features/transactions/screens/CreateTransactionScreen';
import { MissionListScreen } from '../features/missions/api/screens/MissionListScreen';
import { ItemListScreen } from '../features/items/screens/ItemListScreen';
import { CreateItemScreen } from '../features/items/screens/CreateItemScreen';
import { EditItemScreen } from '../features/items/screens/EditItemScreen';
import { ItemDetailScreen } from '../features/items/screens/ItemDetailScreen';
import { ProfileScreen } from '../features/auth/screens/ProfileScreen';

// Redux
import { useAppSelector } from '../store/hooks';
import { theme } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: 'gray',
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTitleStyle: { color: '#fff' },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Missions') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Locations') {
          iconName = focused ? 'location' : 'location-outline';
        } else if (route.name === 'Transactions') {
          iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
        } else if (route.name === 'Items') {
          iconName = focused ? 'cube' : 'cube-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ title: 'Home' }}
    />
    <Tab.Screen
      name="Missions"
      component={MissionListScreen}
      options={{ title: 'Missions' }}
    />
    <Tab.Screen
      name="Locations"
      component={LocationListScreen}
      options={{ title: 'Locations' }}
    />
    <Tab.Screen
      name="Transactions"
      component={TransactionListScreen}
      options={{ title: 'Transactions' }}
    />
    <Tab.Screen
      name="Items"
      component={ItemListScreen}
      options={{ title: 'Items' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Settings', headerShown: false }}
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

            {/* Location Screens */}
            <Stack.Screen
              name="CreateLocation"
              component={CreateLocationScreen}
              options={{
                presentation: 'modal',
                title: 'New Location',
                headerShown: true,
              }}
            />

            {/* Transaction Screens */}
            <Stack.Screen
              name="CreateTransaction"
              component={CreateTransactionScreen}
              options={{
                presentation: 'modal',
                title: 'New Transaction',
                headerShown: true,
              }}
            />

            {/* Item Screens */}
            <Stack.Screen
              name="CreateItem"
              component={CreateItemScreen}
              options={{
                presentation: 'modal',
                title: 'New Item',
                headerShown: true,
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTitleStyle: { color: '#fff' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetailScreen}
              options={{
                title: 'Item Details',
                headerShown: true,
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTitleStyle: { color: '#fff' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="EditItem"
              component={EditItemScreen}
              options={{
                presentation: 'modal',
                title: 'Edit Item',
                headerShown: true,
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTitleStyle: { color: '#fff' },
                headerTintColor: '#fff',
              }}
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
