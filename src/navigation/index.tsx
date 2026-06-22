import React from 'react';
import { Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// Screens
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { CreateLocationScreen } from '../features/locations/screens/CreateLocationScreen';
import { LocationDetailScreen } from '../features/locations/screens/LocationDetailScreen';
import { EditLocationScreen } from '../features/locations/screens/EditLocationScreen';
import { CreateTransactionScreen } from '../features/transactions/screens/CreateTransactionScreen';
import { CreateMissionScreen } from '../features/missions/api/screens/CreateMissionScreen';
import { MissionDetailScreen } from '../features/missions/api/screens/MissionDetailScreen';
import { EditMissionScreen } from '../features/missions/api/screens/EditMissionScreen';
import { ManagementScreen } from '../features/management/screens/ManagementScreen';
import { IncomeScreen } from '../features/income/screens/IncomeScreen';
import { ExpenseScreen } from '../features/expense/screens/ExpenseScreen';
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
  headerStyle: { backgroundColor: theme.colors.surface },
  headerTitleStyle: { color: theme.colors.text, fontWeight: '700' as const, fontSize: 18 },
  headerTintColor: theme.colors.primary,
  headerShadowVisible: false,
  headerLeft: () => <WebBackButton />,
};

const MainTabs = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingBottom: Platform.OS === 'web' ? 0 : 8,
          height: Platform.OS === 'web' ? 60 : 68,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: { 
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: { color: theme.colors.text, fontWeight: '700', fontSize: 20 },
        headerShadowVisible: false,
        headerRight: () => <LanguageSwitcher />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Income') {
            iconName = focused ? 'arrow-up-circle' : 'arrow-up-circle-outline';
          } else if (route.name === 'Expense') {
            iconName = focused ? 'arrow-down-circle' : 'arrow-down-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size + 4} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: t('nav.dashboard') }}
      />
      <Tab.Screen
        name="Income"
        component={IncomeScreen}
        options={{ title: t('nav.income') }}
      />
      <Tab.Screen
        name="Expense"
        component={ExpenseScreen}
        options={{ title: t('nav.expense') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('nav.settings'), headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen name="Main" component={MainTabs} />

            <Stack.Screen
              name="Management"
              component={ManagementScreen}
              options={{ ...headerWithBack, title: t('nav.manage') }}
            />
            <Stack.Screen
              name="CreateLocation"
              component={CreateLocationScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.new_location'),
              }}
            />
            <Stack.Screen
              name="LocationDetail"
              component={LocationDetailScreen}
              options={{ ...headerWithBack, title: t('nav.location_details') }}
            />
            <Stack.Screen
              name="EditLocation"
              component={EditLocationScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.edit_location'),
              }}
            />
            <Stack.Screen
              name="CreateTransaction"
              component={CreateTransactionScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.new_transaction'),
              }}
            />
            <Stack.Screen
              name="CreateItem"
              component={CreateItemScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.new_item'),
              }}
            />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetailScreen}
              options={{ ...headerWithBack, title: t('nav.item_details') }}
            />
            <Stack.Screen
              name="EditItem"
              component={EditItemScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.edit_item'),
              }}
            />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{ ...headerWithBack, title: t('nav.transaction_details') }}
            />
            <Stack.Screen
              name="EditTransaction"
              component={EditTransactionScreen}
              options={{ ...headerWithBack, title: t('nav.edit_transaction') }}
            />
            <Stack.Screen
              name="CreateClient"
              component={CreateClientScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.new_client'),
              }}
            />
            <Stack.Screen
              name="ClientDetail"
              component={ClientDetailScreen}
              options={{ ...headerWithBack, title: t('nav.client_details') }}
            />
            <Stack.Screen
              name="EditClient"
              component={EditClientScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.edit_client'),
              }}
            />
            <Stack.Screen
              name="CreateProvider"
              component={CreateProviderScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.new_provider'),
              }}
            />
            <Stack.Screen
              name="ProviderDetail"
              component={ProviderDetailScreen}
              options={{ ...headerWithBack, title: t('nav.provider_details') }}
            />
            <Stack.Screen
              name="EditProvider"
              component={EditProviderScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.edit_provider'),
              }}
            />
            <Stack.Screen
              name="CreateMission"
              component={CreateMissionScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.new_mission'),
              }}
            />
            <Stack.Screen
              name="MissionDetail"
              component={MissionDetailScreen}
              options={{ ...headerWithBack, title: t('nav.mission_details') }}
            />
            <Stack.Screen
              name="EditMission"
              component={EditMissionScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.edit_mission'),
              }}
            />
            <Stack.Screen
              name="StockList"
              component={StockListScreen}
              options={{ ...headerWithBack, title: t('nav.stock') }}
            />
            <Stack.Screen
              name="ItemStockDetail"
              component={ItemStockDetailScreen}
              options={{ ...headerWithBack, title: t('nav.item_stock') }}
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
