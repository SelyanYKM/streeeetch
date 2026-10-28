import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { ROUTINE_MOMENT_LABELS, SESSION_LABELS } from '../constants/labels';
import { getSessions } from '../database/db';
import { THEME } from '../theme';
import { SessionRecord } from '../types';
import { formatDateTime, formatDuration } from '../utils/format';

/** Historique des séances, la plus récente en haut. */
export function HistoryScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const sessions = useMemo(() => getSessions(), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + THEME.spacing.m }]}>
      <BackButton onPress={onBack} />
      <Text style={styles.title}>Historique</Text>

      <FlatList
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <SessionRow session={item} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + THEME.spacing.m }]}
        ListEmptyComponent={<Text style={styles.empty}>Aucune séance pour l'instant.</Text>}
      />
    </View>
  );
}

function SessionRow({ session }: { session: SessionRecord }) {
  const finished = session.status === 'terminee';
  return (
    // Bordure gauche colorée + étiquette : terminée (vert) ou arrêtée (orange).
    <View style={[styles.row, { borderLeftColor: finished ? THEME.colors.success : THEME.colors.stopped }]}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowTitle}>
          {SESSION_LABELS[session.sessionType]} · {ROUTINE_MOMENT_LABELS[session.moment]}
        </Text>
        <Text style={[styles.status, { color: finished ? THEME.colors.success : THEME.colors.stopped }]}>
          {finished ? 'Terminée' : 'Arrêtée'}
        </Text>
      </View>
      <Text style={styles.rowDetail}>
        {formatDateTime(session.startedAt)} · {formatDuration(session.durationSec)}
      </Text>
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
    fontSize: THEME.fontSize.title,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: THEME.spacing.m,
  },
  listContent: {
    gap: THEME.spacing.s,
  },
  empty: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.body,
    textAlign: 'center',
    marginTop: THEME.spacing.xl,
  },
  row: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius,
    borderLeftWidth: 8,
    padding: THEME.spacing.m,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: THEME.spacing.s,
  },
  rowTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.body,
    fontWeight: '800',
    flexShrink: 1,
  },
  status: {
    fontSize: THEME.fontSize.small,
    fontWeight: '800',
  },
  rowDetail: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.small,
    marginTop: THEME.spacing.xs,
  },
});
