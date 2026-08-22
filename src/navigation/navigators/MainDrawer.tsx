import React from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';
import { CatalogListScreen } from '../../features/catalog/screens/CatalogListScreen';
import { ProfileScreen } from '../../features/auth/screens/ProfileScreen';
import { useAppSelector } from '../../store/hooks';
import { useTheme } from '../../theme/ThemeContext';
import { getDrawerHeaderOptions, getDrawerStyles } from '../headerOptions';
import { IncomeTabNavigator } from './IncomeTabs';
import { ExpenseTabNavigator } from './ExpenseTabs';
import { ItemsTabNavigator } from './ItemsTabs';
import { ManageTabNavigator } from './ManageTabs';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { t } = useTranslation();
  const user = useAppSelector(state => state.auth.user);
  const theme = useTheme();
  const styles = getDrawerStyles(theme);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <View style={styles.drawerAvatar}>
          <Text style={styles.drawerAvatarText}>
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </Text>
        </View>
        <Text style={styles.drawerUsername}>{user?.username || t('auth.guest_user')}</Text>
        <Text style={styles.drawerAppTitle}>{t('auth.app_title')}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

export const MainDrawer = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const headerOptions = getDrawerHeaderOptions(theme);

  return (
    <Drawer.Navigator
      useLegacyImplementation={false}
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        ...headerOptions,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerLabelStyle: { fontSize: 15, fontWeight: '600', marginLeft: -8 },
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 280,
        },
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('nav.home'),
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('nav.dashboard'),
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Income"
        component={IncomeTabNavigator}
        options={{
          title: t('nav.income'),
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Expense"
        component={ExpenseTabNavigator}
        options={{
          title: t('nav.expense'),
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Items"
        component={ItemsTabNavigator}
        options={{
          title: t('nav.items_menu'),
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Catalog"
        component={CatalogListScreen}
        options={{
          title: t('nav.catalog'),
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'albums' : 'albums-outline'} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Manage"
        component={ManageTabNavigator}
        options={{
          title: t('nav.manage'),
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Setting"
        component={ProfileScreen}
        options={{
          title: t('nav.settings'),
          headerShown: false,
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
