import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Tab<T extends string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (tab: T) => void;
}

export function SectionTabBar<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <View style={styles.segmentedControl}>
          {tabs.map(tab => {
            const selected = active === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, selected && styles.tabActive]}
                onPress={() => onChange(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.m,
  },
  row: {
    paddingHorizontal: theme.spacing.l,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border, // light gray
    borderRadius: theme.radius.xl,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radius.l,
    marginRight: 4,
  },
  tabActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
