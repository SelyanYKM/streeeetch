import * as Updates from 'expo-updates';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SESSION_LABELS } from '../constants/labels';
import { findSeedErrors } from '../engine/session';
import { THEME } from '../theme';
import { SessionType } from '../types';
import { formatDateTime } from '../utils/format';
import { ChoiceScreen } from './ChoiceScreen';

// Petit texte en bas de l'écran qui dit quelle version tourne : sert à vérifier
// qu'une mise à jour envoyée depuis GitHub est bien arrivée sur le téléphone.
// runtimeVersion = version de app.json (règle « appVersion »).
const VERSION_LABEL = `v${Updates.runtimeVersion ?? '?'} · ${
  Updates.createdAt && !Updates.isEmbeddedLaunch ? `mise à jour du ${formatDateTime(Updates.createdAt.toISOString())}` : 'version de base'
}`;

// Vérifié une fois au chargement : seed.ts ne change pas pendant que l'app tourne.
const SEED_ERRORS = findSeedErrors();

const SESSION_TYPES: SessionType[] = ['push', 'pull', 'legs'];

interface HomeScreenProps {
  onSelectSessionType: (type: SessionType) => void;
  onOpenHistory: () => void;
  onOpenTests: () => void;
}

export function HomeScreen({ onSelectSessionType, onOpenHistory, onOpenTests }: HomeScreenProps) {
  return (
    <ChoiceScreen
      title="Streeeetch"
      subtitle="Quelle séance aujourd'hui ?"
      options={SESSION_TYPES.map((type) => ({ key: type, label: SESSION_LABELS[type] }))}
      onSelect={onSelectSessionType}
      footer={
        <View style={styles.footer}>
          {SEED_ERRORS.length > 0 && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Erreur dans seed.ts :</Text>
              {SEED_ERRORS.map((error) => (
                <Text key={error} style={styles.errorText}>• {error}</Text>
              ))}
            </View>
          )}
          <View style={styles.links}>
            <TouchableOpacity style={styles.link} onPress={onOpenHistory} hitSlop={12}>
              <Text style={styles.linkText}>Historique</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.link} onPress={onOpenTests} hitSlop={12}>
              <Text style={styles.linkText}>Tests</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.version}>{VERSION_LABEL}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: THEME.spacing.m,
  },
  errorBox: {
    borderWidth: 2,
    borderColor: THEME.colors.danger,
    borderRadius: THEME.radius,
    padding: THEME.spacing.m,
    gap: THEME.spacing.xs,
  },
  errorTitle: {
    color: THEME.colors.danger,
    fontSize: THEME.fontSize.body,
    fontWeight: '800',
  },
  errorText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.small,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.m,
  },
  link: {
    paddingVertical: THEME.spacing.s,
    paddingHorizontal: THEME.spacing.l,
    borderRadius: THEME.radius,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  linkText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.body,
    fontWeight: '700',
  },
  version: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.small,
    textAlign: 'center',
  },
});
