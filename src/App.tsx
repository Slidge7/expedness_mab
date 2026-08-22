import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BootSplash from 'react-native-bootsplash';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppNavigator } from './navigation';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadUserSession } from './store/authSlice';
import { ThemeProvider } from './theme/ThemeContext';

// Create a wrapper component to handle initialization logic
const AppContent = () => {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector(state => state.auth.isHydrated);

  useEffect(() => {
    dispatch(loadUserSession()).finally(async () => {
      if (Platform.OS !== 'web') {
        await BootSplash.hide({ fade: true });
      }
    });
  }, [dispatch]);

  if (!isHydrated) return null; // Or a loading spinner

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
