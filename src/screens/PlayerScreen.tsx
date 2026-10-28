import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getExerciseImage } from '../constants/exerciseImages';
import {
  advanceTo,
  elapsedSec,
  isFinished,
  isPaused,
  pause,
  remainingSec,
  resume,
  skipExercise,
  startPosition,
} from '../engine/player';
import { buildSteps, planSession, Side, Step, totalDurationSec } from '../engine/session';
import { THEME } from '../theme';
import { Moment, PostLength, SessionStatus, SessionType } from '../types';
import { playEndSound, playStartSound } from '../utils/audio';
import { formatDuration } from '../utils/format';
import { triggerEndHaptic, triggerLightHaptic, triggerStartHaptic } from '../utils/haptics';

interface PlayerScreenProps {
  sessionType: SessionType;
  moment: Moment;
  length: PostLength | null;
  // Appelé une seule fois : séance finie (« terminee ») ou arrêtée après confirmation.
  onEnd: (status: SessionStatus, durationSec: number, startedAt: string) => void;
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
export function PlayerScreen({ sessionType, moment, length, onEnd }: PlayerScreenProps) {
  // Écran maintenu allumé tant que le lecteur est affiché (téléphone posé au sol).
  useKeepAwake();
  const insets = useSafeAreaInsets();

  const plan = useMemo(() => planSession(sessionType, moment, length), [sessionType, moment, length]);
  const steps = useMemo(() => buildSteps(plan), [plan]);

  const [position, setPosition] = useState(() => startPosition(steps, Date.now()));
  const startedAtRef = useRef(new Date().toISOString());
  // Garde-fou : la fin (naturelle ou arrêt) n'est signalée qu'une fois.
  const hasEndedRef = useRef(false);
  const endSession = (status: SessionStatus, durationSec: number) => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    onEnd(status, durationSec, startedAtRef.current);
  };
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setPosition((p) => advanceTo(steps, p, t));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [steps]);

  // Son + vibration au début et à la fin de chaque tenue (détectés au changement d'étape,
  // que ce soit la fin naturelle du minuteur ou un appui sur « Passer »).
  const lastStepIndexRef = useRef(position.index);
  useEffect(() => {
    if (position.index === lastStepIndexRef.current) return;
    const previous = steps[lastStepIndexRef.current];
    lastStepIndexRef.current = position.index;
    const current = steps[position.index];
    if (current?.kind === 'hold') {
      playStartSound();
      triggerStartHaptic();
    } else if (previous?.kind === 'hold') {
      playEndSound();
      triggerEndHaptic();
    }
  }, [position.index, steps]);

  // Copie toujours à jour de la position, lisible depuis les callbacks (Alert, bouton retour).
  const positionRef = useRef(position);
  positionRef.current = position;

  // Fin naturelle : dernière tenue écoulée (ou dernier exercice passé).
  const finished = isFinished(steps, position);
  useEffect(() => {
    if (finished) endSession('terminee', elapsedSec(steps, positionRef.current, Date.now()));
  }, [finished]);

  const togglePause = () => {
    triggerLightHaptic();
    setPosition((p) => (isPaused(p) ? resume(p, Date.now()) : pause(p, Date.now())));
  };

  const handleSkip = () => {
    triggerLightHaptic();
    setPosition((p) => skipExercise(steps, p, Date.now()));
  };

  // « Arrêter » : met en pause le temps de la question, pour qu'un appui accidentel
  // (téléphone au sol) ne fasse rien perdre. « Continuer » relance si ça tournait avant.
  const requestStop = () => {
    const wasPaused = isPaused(positionRef.current);
    setPosition((p) => pause(p, Date.now()));
    const continueSession = () => {
      if (!wasPaused) setPosition((p) => resume(p, Date.now()));
    };
    Alert.alert(
      'Arrêter la séance ?',
      'La séance en cours sera interrompue.',
      [
        { text: 'Continuer', style: 'cancel', onPress: continueSession },
        {
          text: 'Arrêter',
          style: 'destructive',
          onPress: () => endSession('arretee', elapsedSec(steps, positionRef.current, Date.now())),
        },
      ],
      { cancelable: true, onDismiss: continueSession }
    );
  };

  // Bouton retour du téléphone : même confirmation que « Arrêter ».
  // Passe par une ref pour n'enregistrer l'écouteur qu'une fois, malgré les rafraîchissements.
  const onBackRef = useRef(() => {});
  onBackRef.current = () => {
    if (!hasEndedRef.current) requestStop();
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBackRef.current();
      return true;
    });
    return () => subscription.remove();
  }, []);

  // Séance finie : l'écran de fin (App.tsx) prend le relais.
  if (finished) return <View style={styles.container} />;

  const step = steps[position.index];
  const remaining = remainingSec(position, now);
  const isTransition = step.kind === 'transition';
  const paused = isPaused(position);
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

      {paused && <Text style={[styles.pausedLabel, isTransition && styles.transitionText]}>EN PAUSE</Text>}
      <Text
        style={[styles.timer, isTransition && styles.transitionText, paused && styles.timerPaused]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {isTransition ? remaining : formatTimer(remaining)}
      </Text>

      <Text style={[styles.instruction, isTransition && styles.transitionText]} numberOfLines={3}>
        {step.exercise.instruction}
      </Text>

      <View style={styles.controls}>
        <ControlButton label="ARRÊTER" onPress={requestStop} />
        <ControlButton label={paused ? 'REPRENDRE' : 'PAUSE'} onPress={togglePause} primary wide />
        <ControlButton label="PASSER" onPress={handleSkip} />
      </View>
    </View>
  );
}

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  primary?: boolean;
  wide?: boolean;
}

function ControlButton({ label, onPress, primary, wide }: ControlButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.controlButton, wide && styles.controlButtonWide, primary && styles.controlButtonPrimary]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.controlText, primary && styles.controlTextPrimary]} adjustsFontSizeToFit numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
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
  timerPaused: {
    opacity: 0.4,
  },
  pausedLabel: {
    color: THEME.colors.accent,
    fontSize: THEME.fontSize.button,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: THEME.spacing.s,
    marginTop: THEME.spacing.m,
  },
  controlButton: {
    flex: 1,
    height: THEME.controlHeight,
    borderRadius: THEME.radius,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.s,
  },
  controlButtonWide: {
    flex: 1.6,
  },
  controlButtonPrimary: {
    backgroundColor: THEME.colors.textPrimary,
    borderColor: THEME.colors.textPrimary,
  },
  controlText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.body,
    fontWeight: '900',
    letterSpacing: 1,
  },
  controlTextPrimary: {
    color: THEME.colors.bg,
  },
});
