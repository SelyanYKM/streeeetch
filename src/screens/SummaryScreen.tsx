import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigButton } from '../components/BigButton';
import { THEME } from '../theme';
import { SessionStatus } from '../types';
import { formatDuration } from '../utils/format';

interface SummaryScreenProps {
  title: string;
  status: SessionStatus;
  durationSec: number;
  saved: boolean;
  onHome: () => void;
  onHistory: () => void;
}

/** Écran de fin de séance : récapitulatif, déjà enregistré dans l'historique. */
export function SummaryScreen({ title, status, durationSec, saved, onHome, onHistory }: SummaryScreenProps) {
  const insets = useSafeAreaInsets();
  const finished = status === 'terminee';

  return (
    <View style={[styles.container, { paddingTop: insets.top + THEME.spacing.m, paddingBottom: insets.bottom + THEME.spacing.m }]}>
      <View style={styles.content}>
        <Text style={[styles.title, !finished && styles.titleStopped]}>
          {finished ? 'Séance terminée' : 'Séance arrêtée'}
        </Text>
        <Text style={styles.detail}>{title}</Text>
        <Text style={styles.duration}>{formatDuration(durationSec)}</Text>
        <Text style={styles.saved}>
          {saved ? "Enregistrée dans l'historique" : "Impossible d'enregistrer dans l'historique"}
        </Text>
      </View>
      <View style={styles.buttons}>
        <BigButton label="ACCUEIL" primary onPress={onHome} />
        <BigButton label="HISTORIQUE" onPress={onHistory} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    paddingHorizontal: THEME.spacing.l,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: THEME.spacing.m,
  },
  title: {
    color: THEME.colors.success,
    fontSize: THEME.fontSize.title,
    fontWeight: '900',
    textAlign: 'center',
  },
  titleStopped: {
    color: THEME.colors.stopped,
  },
  detail: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.button,
    fontWeight: '800',
    textAlign: 'center',
  },
  duration: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.title,
    fontWeight: '900',
    textAlign: 'center',
  },
  saved: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.body,
    textAlign: 'center',
  },
  buttons: {
    gap: THEME.spacing.m,
  },
});
