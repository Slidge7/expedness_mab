import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { AppTheme } from '../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const Card = ({ children, style, noPadding = false, ...props }: CardProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.card, !noPadding && styles.padding, style]} {...props}>
      {children}
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.l,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.m,
  },
  padding: {
    padding: theme.spacing.l,
  },
});
