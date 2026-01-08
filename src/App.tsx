import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import { AppNavigator } from './navigation';

function App(): React.JSX.Element {
  useEffect(() => {
    const init = async () => {
      // Logic to hydrate state or fetch config can go here
    };

    init().finally(async () => {
      // Hide splash screen once React loads
      await BootSplash.hide({ fade: true });
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
