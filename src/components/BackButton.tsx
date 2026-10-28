import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { THEME } from '../theme';

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} hitSlop={16}>
      <Text style={styles.text}>← Retour</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingVertical: THEME.spacing.s,
  },
  text: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.body,
    fontWeight: '700',
  },
});
