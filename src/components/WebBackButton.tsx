import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

export const WebBackButton = () => {
  const navigation = useNavigation();

  if (Platform.OS !== 'web') return null;
  if (!navigation.canGoBack()) return null;

  return (
    <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
      <Text style={styles.text}>← </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    margin: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
