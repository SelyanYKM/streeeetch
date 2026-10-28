import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../theme';

interface BigButtonProps {
  label: string;
  sublabel?: string;
  onPress?: () => void;
  disabled?: boolean;
  primary?: boolean;
}

/** Gros bouton lisible de loin, utilisé pour tous les choix de l'app. */
export function BigButton({ label, sublabel, onPress, disabled, primary }: BigButtonProps) {
  const filled = primary && !disabled;
  return (
    <TouchableOpacity
      style={[styles.button, filled && styles.primary]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.label, filled && styles.primaryText, disabled && styles.disabledText]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.sublabel, filled && styles.primaryText, disabled && styles.disabledText]}>{sublabel}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: THEME.buttonHeight,
    borderRadius: THEME.radius,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.l,
    paddingVertical: THEME.spacing.m,
  },
  primary: {
    backgroundColor: THEME.colors.accent,
    borderColor: THEME.colors.accent,
  },
  content: {
    alignItems: 'center',
  },
  label: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.button,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sublabel: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.body,
    fontWeight: '600',
    marginTop: THEME.spacing.xs,
  },
  primaryText: {
    color: THEME.colors.onAccent,
  },
  disabledText: {
    color: THEME.colors.disabled,
  },
});
