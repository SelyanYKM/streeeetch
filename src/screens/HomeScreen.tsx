import * as Updates from 'expo-updates';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SESSION_LABELS } from '../constants/labels';
import { findSeedErrors } from '../engine/session';
import { THEME } from '../theme';
import { SessionType } from '../types';
import { ChoiceScreen } from './ChoiceScreen';

// Petit texte en bas de l'écran qui dit quelle version tourne : sert à vérifier
// qu'une mise à jour envoyée depuis GitHub est bien arrivée sur le téléphone.
const VERSION_LABEL = `v1.0.0 · étape 3 · ${Updates.updateId ? `maj ${Updates.updateId.slice(0, 8)}` : 'version de base'}`;

// Vérifié une fois au chargement : seed.ts ne change pas pendant que l'app tourne.
const SEED_ERRORS = findSeedErrors();

const SESSION_TYPES: SessionType[] = ['push', 'pull', 'legs'];

export function HomeScreen({ onSelectSessionType }: { onSelectSessionType: (type: SessionType) => void }) {
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
  version: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.small,
    textAlign: 'center',
  },
});
