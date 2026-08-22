// src/features/transactions/components/QuantityPicker.tsx
import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export const QuantityPicker = ({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
}: Props) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const scrollRef = useRef<ScrollView>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track latest offset without triggering re-renders
  const lastOffsetY = useRef(0);

  const items = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step,
  );

  const scrollToIndex = useCallback((index: number, animated = true) => {
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated });
  }, []);

  const commitOffset = useCallback(
    (offsetY: number) => {
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      const snappedValue = items[clampedIndex];
      scrollToIndex(clampedIndex);
      onChange(snappedValue);
    },
    [items, onChange, scrollToIndex],
  );

  // ── Native (Android / iOS): fires after scroll momentum ends ──
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    commitOffset(e.nativeEvent.contentOffset.y);
  };

  // ── Web: onScroll fires continuously; debounce to detect when user stops ──
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    lastOffsetY.current = offsetY;

    if (Platform.OS === 'web') {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        commitOffset(lastOffsetY.current);
      }, 120); // 120 ms after last scroll event = user stopped
    }
  };

  // Scroll to initial value after layout
  const initialIndex = items.indexOf(value);
  const handleLayout = () => {
    if (initialIndex >= 0) {
      scrollToIndex(initialIndex, false);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS;
  const padding = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {/* Selection highlight band */}
      <View
        style={[
          styles.selectionHighlight,
          { top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) },
        ]}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        // Native snap handlers
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        // Web scroll (debounced inside handler)
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: padding }}
        onLayout={handleLayout}
      >
        {items.map(item => {
          const isSelected = item === value;
          return (
            <View key={item} style={styles.item}>
              <Text
                style={[styles.itemText, isSelected && styles.selectedText]}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Fade overlays */}
      <View style={[styles.fade, styles.fadeTop]} pointerEvents="none" />
      <View style={[styles.fade, styles.fadeBottom]} pointerEvents="none" />
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    width: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: `${theme.colors.primary}18`,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '400',
  },
  selectedText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    zIndex: 2,
  },
  fadeTop: {
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  fadeBottom: {
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
});
