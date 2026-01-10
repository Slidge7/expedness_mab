import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppNavigator } from './navigation';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadUserSession } from './store/authSlice';

// Create a wrapper component to handle initialization logic
const AppContent = () => {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector(state => state.auth.isHydrated);

  useEffect(() => {
    dispatch(loadUserSession()).finally(async () => {
      // Hide splash only after checking storage
      await BootSplash.hide({ fade: true });
    });
  }, [dispatch]);

  if (!isHydrated) return null; // Or a loading spinner

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
