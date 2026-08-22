import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { initLanguage } from './src/i18n';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

async function startApp() {
  await initLanguage();
  AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag: document.getElementById('root'),
  });
}

startApp();
