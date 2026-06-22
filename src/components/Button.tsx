import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { theme } from '../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'm' | 'l';
  loading?: boolean;
}

export const Button = ({ title, variant = 'primary', size = 'l', loading, style, ...props }: ButtonProps) => {
  const getBackgroundColor = () => {
    if (props.disabled) return theme.colors.border;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'danger': return theme.colors.danger;
      case 'outline': return 'transparent';
    }
  };

  const getTextColor = () => {
    if (props.disabled) return theme.colors.textSecondary;
    if (variant === 'outline') return theme.colors.primary;
    if (variant === 'secondary') return theme.colors.primary;
    return '#FFFFFF';
  };

  const getBorderColor = () => {
    if (variant === 'outline') return theme.colors.primary;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        size === 'm' ? styles.sizeM : styles.sizeL,
        { backgroundColor: getBackgroundColor(), borderColor: getBorderColor(), borderWidth: variant === 'outline' ? 2 : 0 },
        style
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, size === 'm' ? styles.textM : styles.textL, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.m,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  sizeM: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
  },
  sizeL: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  textM: {
    fontSize: 14,
  },
  textL: {
    fontSize: 16,
  },
});
