import * as Updates from 'expo-updates';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../theme';

const SESSION_TYPES = ['PUSH', 'PULL', 'LEGS'] as const;

// Petit texte en bas de l'écran qui dit quelle version tourne : sert à vérifier
// qu'une mise à jour envoyée depuis GitHub est bien arrivée sur le téléphone.
const VERSION_LABEL = `v1.0.0 · étape 1 · ${Updates.updateId ? `maj ${Updates.updateId.slice(0, 8)}` : 'version de base'}`;

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + THEME.spacing.xl, paddingBottom: insets.bottom + THEME.spacing.m }]}>
      <Text style={styles.title}>Streeeetch</Text>
      <Text style={styles.subtitle}>Quelle séance aujourd'hui ?</Text>

      <View style={styles.buttons}>
        {SESSION_TYPES.map((type) => (
          // Boutons inactifs à l'étape 1 : le choix de séance arrive à l'étape 2.
          <TouchableOpacity key={type} style={styles.button} disabled>
            <Text style={styles.buttonText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>{VERSION_LABEL}</Text>
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
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.body,
    textAlign: 'center',
    marginTop: THEME.spacing.s,
  },
  buttons: {
    flex: 1,
    justifyContent: 'center',
    gap: THEME.spacing.l,
  },
  button: {
    height: THEME.buttonHeight,
    borderRadius: THEME.radius,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: THEME.colors.disabled,
    fontSize: THEME.fontSize.button,
    fontWeight: '900',
    letterSpacing: 2,
  },
  version: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.small,
    textAlign: 'center',
  },
});
