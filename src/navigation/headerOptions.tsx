import React from 'react';
import { Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import type { AppTheme } from '../theme';

const DrawerMenuButton = ({ tintColor }: { tintColor?: string }) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      style={headerStyles.menuBtn}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <Ionicons name="menu" size={24} color={tintColor || '#000'} />
    </TouchableOpacity>
  );
};

const WebBackButton = () => {
  const navigation = useNavigation<any>();
  if (Platform.OS !== 'web') return null;
  if (!navigation.canGoBack()) return null;
  return (
    <TouchableOpacity
      style={headerStyles.backBtn}
      onPress={() => navigation.goBack()}
    >
      <Text style={headerStyles.backText}>←</Text>
    </TouchableOpacity>
  );
};

export const getHeaderWithBack = (theme: AppTheme) => ({
  headerShown: true,
  headerStyle: { backgroundColor: theme.colors.surface },
  headerTitleStyle: { color: theme.colors.text, fontWeight: '700' as const, fontSize: 18 },
  headerTintColor: theme.colors.primary,
  headerShadowVisible: false,
  headerLeft: () => <WebBackButton />,
});

export const getDrawerHeaderOptions = (theme: AppTheme) => ({
  headerStyle: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitleStyle: { color: theme.colors.text, fontWeight: '700' as const, fontSize: 20 },
  headerShadowVisible: false,
  headerTintColor: theme.colors.text,
  headerLeft: () => <DrawerMenuButton tintColor={theme.colors.text} />,
  headerRight: () => <LanguageSwitcher />,
});

export const getBottomTabScreenOptions = (theme: AppTheme) => ({
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textSecondary,
  tabBarLabelPosition: 'below-icon' as const,
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
    fontWeight: '600' as const,
  },
  headerShown: false,
});

export const getDrawerStyles = (theme: AppTheme) =>
  StyleSheet.create({
    drawerContent: {
      paddingTop: 8,
    },
    drawerHeader: {
      paddingHorizontal: 20,
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: 8,
    },
    drawerAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    drawerAvatarText: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFF',
    },
    drawerUsername: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    drawerAppTitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
  });

// Backward-compatible static exports (use light theme defaults)
// These are kept for files not yet migrated to useTheme
import { theme } from '../theme';

export const headerWithBack = getHeaderWithBack(theme);
export const drawerHeaderOptions = getDrawerHeaderOptions(theme);
export const bottomTabScreenOptions = getBottomTabScreenOptions(theme);
export const drawerStyles = getDrawerStyles(theme);

const headerStyles = StyleSheet.create({
  menuBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 4,
  },
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
