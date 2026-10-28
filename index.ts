import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent appelle AppRegistry.registerComponent('main', () => App)
// et prépare l'environnement, que l'app tourne dans Expo Go ou dans un APK.
registerRootComponent(App);
