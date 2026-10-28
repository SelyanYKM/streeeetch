import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LENGTH_LABELS, MOMENT_LABELS, SESSION_LABELS } from './src/constants/labels';
import { sessionDurationSec } from './src/engine/session';
import { ChoiceScreen } from './src/screens/ChoiceScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PreviewScreen } from './src/screens/PreviewScreen';
import { THEME } from './src/theme';
import { Moment, PostLength, SessionType } from './src/types';
import { formatDuration } from './src/utils/format';

// Navigation par état : l'écran courant + les choix déjà faits, sans librairie.
// Parcours : accueil (push/pull/legs) → moment (pré/post) → durée (post seulement) → aperçu.
type ScreenState = 'HOME' | 'MOMENT' | 'LENGTH' | 'PREVIEW';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('HOME');
  const [sessionType, setSessionType] = useState<SessionType>('push');
  const [moment, setMoment] = useState<Moment>('pre');
  const [length, setLength] = useState<PostLength | null>(null);

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

  // Écran précédent du parcours (null sur l'accueil : le retour quitte alors l'app).
  const previousScreen: ScreenState | null =
    currentScreen === 'PREVIEW' ? (moment === 'post' ? 'LENGTH' : 'MOMENT')
    : currentScreen === 'LENGTH' ? 'MOMENT'
    : currentScreen === 'MOMENT' ? 'HOME'
    : null;

  const goBack = () => {
    if (previousScreen) setCurrentScreen(previousScreen);
  };

  // Bouton retour physique / geste retour Android : remonte d'un écran dans le parcours.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!previousScreen) return false;
      setCurrentScreen(previousScreen);
      return true;
    });
    return () => subscription.remove();
  }, [previousScreen]);

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

        {currentScreen === 'HOME' && (
          <HomeScreen
            onSelectSessionType={(type) => {
              setSessionType(type);
              setCurrentScreen('MOMENT');
            }}
          />
        )}

        {currentScreen === 'MOMENT' && (
          <ChoiceScreen<Moment>
            title={SESSION_LABELS[sessionType]}
            subtitle="Avant ou après la séance ?"
            options={[
              { key: 'pre', label: MOMENT_LABELS.pre, sublabel: `Mobilité · ${formatDuration(sessionDurationSec(sessionType, 'pre', null))}` },
              { key: 'post', label: MOMENT_LABELS.post, sublabel: 'Étirements · courte ou longue' },
            ]}
            onSelect={(m) => {
              setMoment(m);
              setLength(null);
              setCurrentScreen(m === 'post' ? 'LENGTH' : 'PREVIEW');
            }}
            onBack={goBack}
          />
        )}

        {currentScreen === 'LENGTH' && (
          <ChoiceScreen<PostLength>
            title={`${SESSION_LABELS[sessionType]} · ${MOMENT_LABELS.post}`}
            subtitle="Quelle durée ?"
            options={(['courte', 'longue'] as const).map((l) => ({
              key: l,
              label: LENGTH_LABELS[l],
              sublabel: formatDuration(sessionDurationSec(sessionType, 'post', l)),
            }))}
            onSelect={(l) => {
              setLength(l);
              setCurrentScreen('PREVIEW');
            }}
            onBack={goBack}
          />
        )}

        {currentScreen === 'PREVIEW' && (
          <PreviewScreen
            title={[SESSION_LABELS[sessionType], MOMENT_LABELS[moment], length ? LENGTH_LABELS[length] : null]
              .filter(Boolean)
              .join(' · ')}
            sessionType={sessionType}
            moment={moment}
            length={length}
            onBack={goBack}
          />
        )}
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
