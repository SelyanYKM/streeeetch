import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { THEME } from './src/theme';

// Navigation par état : un seul écran pour l'instant, les autres arrivent aux étapes suivantes.
type ScreenState = 'HOME';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentScreen] = useState<ScreenState>('HOME');

  useEffect(() => {
    async function setup() {
      try {
        // Vérifie et applique une éventuelle mise à jour OTA avant d'afficher l'app : par
        // défaut, expo-updates télécharge en arrière-plan mais n'applique qu'au PROCHAIN
        // lancement, ce qui donne l'impression que "rien ne change" après une mise à jour.
        // Un timeout évite de bloquer l'app si le réseau est absent ou lent (salle de sport).
        if (!__DEV__ && Updates.isEnabled) {
          try {
            const result = await Promise.race([
              Updates.checkForUpdateAsync(),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
            ]);
            if (result && result.isAvailable) {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
              return;
            }
          } catch (updateError) {
            console.error('Vérification de mise à jour OTA impossible:', updateError);
          }
        }
      } finally {
        setIsReady(true);
      }
    }
    setup();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.accent} />
        <StatusBar style={THEME.statusBarStyle} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        <StatusBar style={THEME.statusBarStyle} />
        {currentScreen === 'HOME' && <HomeScreen />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
