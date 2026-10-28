import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LENGTH_LABELS, MOMENT_LABELS, SESSION_LABELS } from './src/constants/labels';
import { initDatabase, saveSession } from './src/database/db';
import { FLEXIBILITY_TESTS } from './src/database/seed';
import { routineMoment, sessionDurationSec } from './src/engine/session';
import { ChoiceScreen } from './src/screens/ChoiceScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { PreviewScreen } from './src/screens/PreviewScreen';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { TestDetailScreen } from './src/screens/TestDetailScreen';
import { TestsScreen } from './src/screens/TestsScreen';
import { THEME } from './src/theme';
import { Moment, PostLength, SessionStatus, SessionType } from './src/types';
import { configureAppAudio, preloadSignalSounds } from './src/utils/audio';
import { formatDuration } from './src/utils/format';

// Navigation par état : l'écran courant + les choix déjà faits, sans librairie.
// Parcours : accueil (push/pull/legs) → moment (pré/post) → durée (post seulement) → aperçu
// → lecteur → fin de séance. L'historique s'ouvre depuis l'accueil ou la fin de séance,
// les tests de souplesse depuis l'accueil (liste → fiche d'un test).
type ScreenState =
  | 'HOME'
  | 'MOMENT'
  | 'LENGTH'
  | 'PREVIEW'
  | 'PLAYER'
  | 'SUMMARY'
  | 'HISTORY'
  | 'TESTS'
  | 'TEST_DETAIL';

// En dessous, une séance arrêtée est un faux départ : elle n'est pas enregistrée.
const MIN_RECORDED_STOP_SEC = 30;

interface SessionSummary {
  status: SessionStatus;
  durationSec: number;
  saved: boolean;
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('HOME');
  const [sessionType, setSessionType] = useState<SessionType>('push');
  const [moment, setMoment] = useState<Moment>('pre');
  const [length, setLength] = useState<PostLength | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

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
        try {
          initDatabase();
        } catch (dbError) {
          // L'app reste utilisable sans historique plutôt que de bloquer au démarrage.
          console.error('Ouverture de la base impossible:', dbError);
        }
        await configureAppAudio();
        preloadSignalSounds();
      } finally {
        setIsReady(true);
      }
    }
    setup();
  }, []);

  // Écran précédent du parcours. null sur l'accueil (le retour quitte l'app) et sur le
  // lecteur (il gère lui-même le retour, avec la confirmation d'arrêt).
  const previousScreen: ScreenState | null =
    currentScreen === 'SUMMARY' || currentScreen === 'HISTORY' || currentScreen === 'TESTS' ? 'HOME'
    : currentScreen === 'TEST_DETAIL' ? 'TESTS'
    : currentScreen === 'PREVIEW' ? (moment === 'post' ? 'LENGTH' : 'MOMENT')
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

  const selectedTest = FLEXIBILITY_TESTS.find((t) => t.id === selectedTestId);

  const sessionTitle = [SESSION_LABELS[sessionType], MOMENT_LABELS[moment], length ? LENGTH_LABELS[length] : null]
    .filter(Boolean)
    .join(' · ');

  // Fin de séance : enregistre (sauf faux départ arrêté avant 30 s) puis affiche le récapitulatif.
  const handleSessionEnd = (status: SessionStatus, durationSec: number, startedAt: string) => {
    if (status === 'arretee' && durationSec < MIN_RECORDED_STOP_SEC) {
      setCurrentScreen('HOME');
      return;
    }
    let saved = true;
    try {
      saveSession({ startedAt, sessionType, moment: routineMoment(moment, length), durationSec, status });
    } catch (error) {
      console.error("Enregistrement de la séance impossible:", error);
      saved = false;
    }
    setSummary({ status, durationSec, saved });
    setCurrentScreen('SUMMARY');
  };

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
            onOpenHistory={() => setCurrentScreen('HISTORY')}
            onOpenTests={() => setCurrentScreen('TESTS')}
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
            title={sessionTitle}
            sessionType={sessionType}
            moment={moment}
            length={length}
            onBack={goBack}
            onStart={() => setCurrentScreen('PLAYER')}
          />
        )}

        {currentScreen === 'PLAYER' && (
          <PlayerScreen sessionType={sessionType} moment={moment} length={length} onEnd={handleSessionEnd} />
        )}

        {currentScreen === 'SUMMARY' && summary && (
          <SummaryScreen
            title={sessionTitle}
            status={summary.status}
            durationSec={summary.durationSec}
            saved={summary.saved}
            onHome={() => setCurrentScreen('HOME')}
            onHistory={() => setCurrentScreen('HISTORY')}
          />
        )}

        {currentScreen === 'HISTORY' && <HistoryScreen onBack={() => setCurrentScreen('HOME')} />}

        {currentScreen === 'TESTS' && (
          <TestsScreen
            onSelectTest={(testId) => {
              setSelectedTestId(testId);
              setCurrentScreen('TEST_DETAIL');
            }}
            onBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'TEST_DETAIL' && selectedTest && (
          <TestDetailScreen test={selectedTest} onBack={() => setCurrentScreen('TESTS')} />
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
