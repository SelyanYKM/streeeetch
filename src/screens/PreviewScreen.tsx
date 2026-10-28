import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { BigButton } from '../components/BigButton';
import { buildSteps, planSession, totalDurationSec } from '../engine/session';
import { THEME } from '../theme';
import { Moment, PostLength, SessionType } from '../types';
import { formatDuration } from '../utils/format';

interface PreviewScreenProps {
  title: string;
  sessionType: SessionType;
  moment: Moment;
  length: PostLength | null;
  onBack: () => void;
  onStart: () => void;
}

/** Aperçu de la séance : exercices, séries, durées et durée totale. */
export function PreviewScreen({ title, sessionType, moment, length, onBack, onStart }: PreviewScreenProps) {
  const insets = useSafeAreaInsets();
  const plan = useMemo(() => planSession(sessionType, moment, length), [sessionType, moment, length]);
  const totalSec = useMemo(() => totalDurationSec(buildSteps(plan)), [plan]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + THEME.spacing.m, paddingBottom: insets.bottom + THEME.spacing.m }]}>
      <BackButton onPress={onBack} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.total}>{formatDuration(totalSec)}</Text>
      <Text style={styles.totalHint}>
        {plan.length} exercices · transitions et deux côtés inclus
      </Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {plan.map((item, index) => (
          <View key={`${item.exercise.id}-${index}`} style={styles.row}>
            <Text style={styles.exerciseName}>{item.exercise.name}</Text>
            <Text style={styles.exerciseDetail}>
              {item.sets} × {item.holdSec} s{item.exercise.unilateral ? ' · droite puis gauche' : ''}
            </Text>
          </View>
        ))}
      </ScrollView>

      <BigButton label="COMMENCER" primary onPress={onStart} disabled={plan.length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    paddingHorizontal: THEME.spacing.l,
  },
  title: {
    color: THEME.colors.accent,
    fontSize: THEME.fontSize.heading,
    fontWeight: '900',
    textAlign: 'center',
  },
  total: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.title,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: THEME.spacing.s,
  },
  totalHint: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.small,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    marginVertical: THEME.spacing.m,
  },
  listContent: {
    gap: THEME.spacing.s,
  },
  row: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius,
    padding: THEME.spacing.m,
  },
  exerciseName: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.body,
    fontWeight: '800',
  },
  exerciseDetail: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.small,
    marginTop: THEME.spacing.xs,
  },
});
