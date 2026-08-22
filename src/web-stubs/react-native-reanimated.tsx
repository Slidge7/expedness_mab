import React, { useMemo, useReducer, useRef } from 'react';
import { View } from 'react-native';

export type SharedValue<T> = {
  value: T;
};

function useReactiveValue<T>(initial: T): SharedValue<T> {
  const [, forceUpdate] = useReducer((count: number) => count + 1, 0);
  const storeRef = useRef<{ current: T }>({ current: initial });

  return useMemo(
    () =>
      Object.defineProperty({}, 'value', {
        enumerable: true,
        get: () => storeRef.current.current,
        set: (next: T) => {
          storeRef.current.current = next;
          forceUpdate();
        },
      }) as SharedValue<T>,
    [],
  );
}

export function useSharedValue<T>(initial: T): SharedValue<T> {
  return useReactiveValue(initial);
}

export function useDerivedValue<T>(factory: () => T): SharedValue<T> {
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  return useMemo(
    () =>
      Object.defineProperty({}, 'value', {
        enumerable: true,
        get: () => factoryRef.current(),
      }) as SharedValue<T>,
    [],
  );
}

export function useAnimatedStyle(factory: () => Record<string, unknown>) {
  const factoryRef = useRef(factory);
  factoryRef.current = factory;
  return factoryRef.current();
}

export function useAnimatedProps(factory: () => Record<string, unknown>) {
  const factoryRef = useRef(factory);
  factoryRef.current = factory;
  return factoryRef.current();
}

export function useAnimatedGestureHandler(
  handlers: Record<string, (event: any, context: any) => void>,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const contextRef = useRef({ startX: 0, hasCalledOnStart: false });

  return (event: { nativeEvent: any }) => {
    const nativeEvent = event.nativeEvent;
    const context = contextRef.current;
    const state = nativeEvent.state;

    if (state === 2) {
      context.hasCalledOnStart = false;
      handlersRef.current.onStart?.(nativeEvent, context);
    }

    if (state === 4) {
      handlersRef.current.onActive?.(nativeEvent, context);
      if (!context.hasCalledOnStart) {
        context.hasCalledOnStart = true;
      }
    }

    if (state === 5 || state === 3) {
      handlersRef.current.onEnd?.(nativeEvent, context);
      handlersRef.current.onFinish?.(nativeEvent, context);
    }
  };
}

export function interpolate(
  value: number,
  inputRange: number[],
  outputRange: number[],
): number {
  if (inputRange.length !== outputRange.length || inputRange.length < 2) {
    return outputRange[0] ?? value;
  }

  if (value <= inputRange[0]) return outputRange[0];
  if (value >= inputRange[inputRange.length - 1]) {
    return outputRange[outputRange.length - 1];
  }

  for (let i = 0; i < inputRange.length - 1; i += 1) {
    const inputStart = inputRange[i];
    const inputEnd = inputRange[i + 1];
    if (value >= inputStart && value <= inputEnd) {
      const progress = (value - inputStart) / (inputEnd - inputStart || 1);
      return outputRange[i] + progress * (outputRange[i + 1] - outputRange[i]);
    }
  }

  return outputRange[outputRange.length - 1];
}

export function withSpring(value: number): number {
  return value;
}

export function withTiming(value: number): number {
  return value;
}

export function runOnJS<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>) => fn(...args)) as T;
}

export function isConfigured(): boolean {
  return true;
}

export function isReanimated3(): boolean {
  return true;
}

export function makeMutable<T>(initial: T): SharedValue<T> {
  return { value: initial };
}

export function cancelAnimation(): void {}

export function createAnimatedComponent<T extends React.ComponentType<any>>(Component: T) {
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    const { animatedProps, ...rest } = props as Record<string, unknown>;
    return (
      <Component
        ref={ref}
        {...(rest as React.ComponentProps<T>)}
        {...((animatedProps as Record<string, unknown>) ?? {})}
      />
    );
  });
}

const Animated = {
  View: createAnimatedComponent(View),
  createAnimatedComponent,
};

export default Animated;
