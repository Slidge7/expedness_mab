import React from 'react';
import { Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { CreateLocationScreen } from '../features/locations/screens/CreateLocationScreen';
import { LocationDetailScreen } from '../features/locations/screens/LocationDetailScreen';
import { EditLocationScreen } from '../features/locations/screens/EditLocationScreen';
import { TransactionListScreen } from '../features/transactions/screens/TransactionListScreen';
import { CreateTransactionScreen } from '../features/transactions/screens/CreateTransactionScreen';
import { CreateMissionScreen } from '../features/missions/api/screens/CreateMissionScreen';
import { MissionDetailScreen } from '../features/missions/api/screens/MissionDetailScreen';
import { EditMissionScreen } from '../features/missions/api/screens/EditMissionScreen';
import { ManagementScreen } from '../features/management/screens/ManagementScreen';
import { ItemListScreen } from '../features/items/screens/ItemListScreen';
import { CreateItemScreen } from '../features/items/screens/CreateItemScreen';
import { EditItemScreen } from '../features/items/screens/EditItemScreen';
import { ItemDetailScreen } from '../features/items/screens/ItemDetailScreen';
import { ProfileScreen } from '../features/auth/screens/ProfileScreen';
import { CreateClientScreen } from '../features/clients/screens/CreateClientScreen';
import { EditClientScreen } from '../features/clients/screens/EditClientScreen';
import { ClientDetailScreen } from '../features/clients/screens/ClientDetailScreen';
import { CreateProviderScreen } from '../features/providers/screens/CreateProviderScreen';
import { EditProviderScreen } from '../features/providers/screens/EditProviderScreen';
import { ProviderDetailScreen } from '../features/providers/screens/ProviderDetailScreen';
import { StockListScreen } from '../features/stock/screens/StockListScreen';
import { ItemStockDetailScreen } from '../features/stock/screens/ItemStockDetailScreen';

// Redux
import { useAppSelector } from '../store/hooks';
import { theme } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TransactionDetailScreen } from '../features/transactions/screens/Transactiondetailscreen';
import { EditTransactionScreen } from '../features/transactions/screens/EditTransactionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Web-only back button for headers
const WebBackButton = () => {
  const navigation = useNavigation();
  if (Platform.OS !== 'web') return null;
  return (
    <TouchableOpacity
      style={styles.backBtn}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.backText}>←</Text>
    </TouchableOpacity>
  );
};

// Shared header options for screens with back button
const headerWithBack = {
  headerShown: true,
  headerStyle: { backgroundColor: theme.colors.primary },
  headerTitleStyle: { color: '#fff' },
  headerTintColor: '#fff',
  headerLeft: () => <WebBackButton />,
};

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
        } else if (route.name === 'Manage') {
          iconName = focused ? 'briefcase' : 'briefcase-outline';
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
      name="Manage"
      component={ManagementScreen}
      options={{ title: 'Manage' }}
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
          <Stack.Group>
            <Stack.Screen name="Main" component={MainTabs} />

            <Stack.Screen
              name="CreateLocation"
              component={CreateLocationScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'New Location',
              }}
            />
            <Stack.Screen
              name="LocationDetail"
              component={LocationDetailScreen}
              options={{ ...headerWithBack, title: 'Location Details' }}
            />
            <Stack.Screen
              name="EditLocation"
              component={EditLocationScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'Edit Location',
              }}
            />
            <Stack.Screen
              name="CreateTransaction"
              component={CreateTransactionScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'New Transaction',
              }}
            />
            <Stack.Screen
              name="CreateItem"
              component={CreateItemScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'New Item',
              }}
            />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetailScreen}
              options={{ ...headerWithBack, title: 'Item Details' }}
            />
            <Stack.Screen
              name="EditItem"
              component={EditItemScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'Edit Item',
              }}
            />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{ ...headerWithBack, title: 'Transaction Details' }}
            />
            <Stack.Screen
              name="EditTransaction"
              component={EditTransactionScreen}
              options={{ ...headerWithBack, title: 'Edit Transaction' }}
            />
            <Stack.Screen
              name="CreateClient"
              component={CreateClientScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'New Client',
              }}
            />
            <Stack.Screen
              name="ClientDetail"
              component={ClientDetailScreen}
              options={{ ...headerWithBack, title: 'Client Details' }}
            />
            <Stack.Screen
              name="EditClient"
              component={EditClientScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'Edit Client',
              }}
            />
            <Stack.Screen
              name="CreateProvider"
              component={CreateProviderScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'New Provider',
              }}
            />
            <Stack.Screen
              name="ProviderDetail"
              component={ProviderDetailScreen}
              options={{ ...headerWithBack, title: 'Provider Details' }}
            />
            <Stack.Screen
              name="EditProvider"
              component={EditProviderScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'Edit Provider',
              }}
            />
            <Stack.Screen
              name="CreateMission"
              component={CreateMissionScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'New Mission',
              }}
            />
            <Stack.Screen
              name="MissionDetail"
              component={MissionDetailScreen}
              options={{ ...headerWithBack, title: 'Mission Details' }}
            />
            <Stack.Screen
              name="EditMission"
              component={EditMissionScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'Edit Mission',
              }}
            />
            <Stack.Screen
              name="StockList"
              component={StockListScreen}
              options={{ ...headerWithBack, title: 'Stock' }}
            />
            <Stack.Screen
              name="ItemStockDetail"
              component={ItemStockDetailScreen}
              options={{ ...headerWithBack, title: 'Item Stock' }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 4,
  },
  backText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
