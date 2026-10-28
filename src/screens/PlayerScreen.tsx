import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigButton } from '../components/BigButton';
import { getExerciseImage } from '../constants/exerciseImages';
import { advanceTo, isFinished, remainingSec, startPosition } from '../engine/player';
import { buildSteps, planSession, Side, Step, totalDurationSec } from '../engine/session';
import { THEME } from '../theme';
import { Moment, PostLength, SessionType } from '../types';
import { formatDuration } from '../utils/format';

interface PlayerScreenProps {
  title: string;
  sessionType: SessionType;
  moment: Moment;
  length: PostLength | null;
  onExit: () => void;
}

const SIDE_LABELS: Record<Exclude<Side, null>, string> = {
  droite: 'côté droit',
  gauche: 'côté gauche',
};

// Rafraîchissement de l'affichage : assez fréquent pour que le chiffre change pile à la seconde.
const TICK_MS = 250;

/** « Série 2/3 — côté gauche » (ou « Série 1/2 » pour un exercice non unilatéral). */
function setLabel(step: Step): string {
  const set = `Série ${step.set}/${step.totalSets}`;
  return step.side ? `${set} — ${SIDE_LABELS[step.side]}` : set;
}

/** Lecteur de séance : enchaîne automatiquement transitions et tenues. */
export function PlayerScreen({ title, sessionType, moment, length, onExit }: PlayerScreenProps) {
  // Écran maintenu allumé tant que le lecteur est affiché (téléphone posé au sol).
  useKeepAwake();
  const insets = useSafeAreaInsets();

  const plan = useMemo(() => planSession(sessionType, moment, length), [sessionType, moment, length]);
  const steps = useMemo(() => buildSteps(plan), [plan]);

  const [position, setPosition] = useState(() => startPosition(steps, Date.now()));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setPosition((p) => advanceTo(steps, p, t));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [steps]);

  if (isFinished(steps, position)) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top, paddingBottom: insets.bottom + THEME.spacing.m }]}>
        <View style={styles.finishedContent}>
          <Text style={styles.finishedTitle}>Séance terminée</Text>
          <Text style={styles.finishedDetail}>{title}</Text>
          <Text style={styles.finishedDetail}>{formatDuration(totalDurationSec(steps))}</Text>
        </View>
        <BigButton label="ACCUEIL" primary onPress={onExit} />
      </View>
    );
  }

  const step = steps[position.index];
  const remaining = remainingSec(position, now);
  const isTransition = step.kind === 'transition';
  // Temps restant de toute la séance : fin de l'étape en cours + étapes suivantes.
  const sessionRemaining = remaining + totalDurationSec(steps.slice(position.index + 1));

  return (
    <View
      style={[
        styles.container,
        isTransition && styles.transitionContainer,
        { paddingTop: insets.top + THEME.spacing.m, paddingBottom: insets.bottom + THEME.spacing.m },
      ]}
    >
      <View style={styles.topBar}>
        <Text style={[styles.topText, isTransition && styles.transitionMuted]}>
          Exercice {step.exerciseIndex + 1}/{plan.length}
        </Text>
        <Text style={[styles.topText, isTransition && styles.transitionMuted]}>
          reste {formatDuration(sessionRemaining)}
        </Text>
      </View>

      {isTransition && <Text style={styles.prepare}>PRÉPARE-TOI</Text>}

      <Text style={[styles.exerciseName, isTransition && styles.transitionText]} numberOfLines={2}>
        {step.exercise.name}
      </Text>
      <Text style={[styles.setLabel, isTransition && styles.transitionText]}>{setLabel(step)}</Text>

      {isTransition ? (
        <View style={styles.flexFill} />
      ) : (
        <View style={styles.imageWrapper}>
          <Image source={getExerciseImage(step.exercise.imageKey)} style={styles.image} resizeMode="contain" />
        </View>
      )}

      <Text
        style={[styles.timer, isTransition && styles.transitionText]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {isTransition ? remaining : formatTimer(remaining)}
      </Text>

      <Text style={[styles.instruction, isTransition && styles.transitionText]} numberOfLines={3}>
        {step.exercise.instruction}
      </Text>
    </View>
  );
}

/** 75 → « 1:15 », 30 → « 0:30 ». */
function formatTimer(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    paddingHorizontal: THEME.spacing.l,
  },
  // Fond jaune pendant les transitions : on voit de loin qu'il faut changer de position.
  transitionContainer: {
    backgroundColor: THEME.colors.accent,
  },
  transitionText: {
    color: THEME.colors.onAccent,
  },
  transitionMuted: {
    color: THEME.colors.onAccent,
    opacity: 0.7,
  },
  centered: {
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.body,
    fontWeight: '700',
  },
  prepare: {
    color: THEME.colors.onAccent,
    fontSize: THEME.fontSize.heading,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: THEME.spacing.l,
  },
  exerciseName: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.heading,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: THEME.spacing.m,
  },
  setLabel: {
    color: THEME.colors.accent,
    fontSize: THEME.fontSize.button,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: THEME.spacing.s,
  },
  flexFill: {
    flex: 1,
  },
  imageWrapper: {
    flex: 1,
    marginVertical: THEME.spacing.m,
  },
  image: {
    flex: 1,
    width: '100%',
    borderRadius: THEME.radius,
  },
  timer: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.timer,
    fontWeight: '900',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  instruction: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: THEME.spacing.s,
  },
  finishedContent: {
    flex: 1,
    justifyContent: 'center',
    gap: THEME.spacing.m,
  },
  finishedTitle: {
    color: THEME.colors.accent,
    fontSize: THEME.fontSize.title,
    fontWeight: '900',
    textAlign: 'center',
  },
  finishedDetail: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.button,
    fontWeight: '700',
    textAlign: 'center',
  },
});
