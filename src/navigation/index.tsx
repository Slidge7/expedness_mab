import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { ManagementScreen } from '../features/management/screens/ManagementScreen';
import { CreateLocationScreen } from '../features/locations/screens/CreateLocationScreen';
import { LocationDetailScreen } from '../features/locations/screens/LocationDetailScreen';
import { EditLocationScreen } from '../features/locations/screens/EditLocationScreen';
import { CreateTransactionScreen } from '../features/transactions/screens/CreateTransactionScreen';
import { CreateMissionScreen } from '../features/missions/screens/CreateMissionScreen';
import { MissionDetailScreen } from '../features/missions/screens/MissionDetailScreen';
import { EditMissionScreen } from '../features/missions/screens/EditMissionScreen';
import { CreateItemScreen } from '../features/items/screens/CreateItemScreen';
import { EditItemScreen } from '../features/items/screens/EditItemScreen';
import { ItemDetailScreen } from '../features/items/screens/ItemDetailScreen';
import { CreateClientScreen } from '../features/clients/screens/CreateClientScreen';
import { EditClientScreen } from '../features/clients/screens/EditClientScreen';
import { ClientDetailScreen } from '../features/clients/screens/ClientDetailScreen';
import { CreateProviderScreen } from '../features/providers/screens/CreateProviderScreen';
import { EditProviderScreen } from '../features/providers/screens/EditProviderScreen';
import { ProviderDetailScreen } from '../features/providers/screens/ProviderDetailScreen';
import { CreateMarqueScreen } from '../features/marques/screens/CreateMarqueScreen';
import { EditMarqueScreen } from '../features/marques/screens/EditMarqueScreen';
import { MarqueDetailScreen } from '../features/marques/screens/MarqueDetailScreen';
import { CreateCategoryScreen } from '../features/categories/screens/CreateCategoryScreen';
import { EditCategoryScreen } from '../features/categories/screens/EditCategoryScreen';
import { CategoryDetailScreen } from '../features/categories/screens/CategoryDetailScreen';
import { StockListScreen } from '../features/stock/screens/StockListScreen';
import { ItemStockDetailScreen } from '../features/stock/screens/ItemStockDetailScreen';
import { CatalogListScreen } from '../features/catalog/screens/CatalogListScreen';
import { CreateCatalogScreen } from '../features/catalog/screens/CreateCatalogScreen';
import { EditCatalogScreen } from '../features/catalog/screens/EditCatalogScreen';
import { CatalogDetailScreen } from '../features/catalog/screens/CatalogDetailScreen';
import { PublicCatalogScreen } from '../features/catalog/screens/PublicCatalogScreen';
import { TransactionDetailScreen } from '../features/transactions/screens/Transactiondetailscreen';
import { EditTransactionScreen } from '../features/transactions/screens/EditTransactionScreen';
import { useAppSelector } from '../store/hooks';
import { useTheme } from '../theme/ThemeContext';
import { linking } from './linking';
import { getHeaderWithBack } from './headerOptions';
import { MainDrawer } from './navigators/MainDrawer';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const { t } = useTranslation();
  const theme = useTheme();
  const headerWithBack = getHeaderWithBack(theme);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? 'Main' : 'Login'}
      >
        {isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen name="Main" component={MainDrawer} />

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
              name="CreateMarque"
              component={CreateMarqueScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.new_marque'),
              }}
            />
            <Stack.Screen
              name="MarqueDetail"
              component={MarqueDetailScreen}
              options={{ ...headerWithBack, title: t('nav.marque_details') }}
            />
            <Stack.Screen
              name="EditMarque"
              component={EditMarqueScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.edit_marque'),
              }}
            />
            <Stack.Screen
              name="CreateCategory"
              component={CreateCategoryScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.new_category'),
              }}
            />
            <Stack.Screen
              name="CategoryDetail"
              component={CategoryDetailScreen}
              options={{ ...headerWithBack, title: t('nav.category_details') }}
            />
            <Stack.Screen
              name="EditCategory"
              component={EditCategoryScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: t('nav.edit_category'),
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
            <Stack.Screen
              name="CatalogList"
              component={CatalogListScreen}
              options={{ ...headerWithBack, title: t('nav.catalog') }}
            />
            <Stack.Screen
              name="CreateCatalog"
              component={CreateCatalogScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'New catalog',
              }}
            />
            <Stack.Screen
              name="CatalogDetail"
              component={CatalogDetailScreen}
              options={{ ...headerWithBack, title: 'Catalog details' }}
            />
            <Stack.Screen
              name="EditCatalog"
              component={EditCatalogScreen}
              options={{
                ...headerWithBack,
                presentation: 'modal',
                title: 'Edit catalog',
              }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
        <Stack.Screen
          name="PublicCatalog"
          component={PublicCatalogScreen}
          options={{ ...headerWithBack, title: t('nav.catalog'), headerShown: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
