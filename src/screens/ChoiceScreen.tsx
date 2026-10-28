import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { BigButton } from '../components/BigButton';
import { THEME } from '../theme';

export interface ChoiceOption<K extends string> {
  key: K;
  label: string;
  sublabel?: string;
}

interface ChoiceScreenProps<K extends string> {
  title: string;
  subtitle: string;
  options: ChoiceOption<K>[];
  onSelect: (key: K) => void;
  onBack?: () => void;
  // Contenu libre sous les boutons (ex. message d'erreur, version de l'app).
  footer?: React.ReactNode;
}

/** Écran de choix générique : un titre et quelques gros boutons empilés. */
export function ChoiceScreen<K extends string>({ title, subtitle, options, onSelect, onBack, footer }: ChoiceScreenProps<K>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + THEME.spacing.m, paddingBottom: insets.bottom + THEME.spacing.m }]}>
      <View style={styles.header}>
        {onBack ? <BackButton onPress={onBack} /> : <View style={styles.backPlaceholder} />}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.buttons}>
        {options.map((option) => (
          <BigButton
            key={option.key}
            label={option.label}
            sublabel={option.sublabel}
            onPress={() => onSelect(option.key)}
          />
        ))}
      </View>

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    paddingHorizontal: THEME.spacing.l,
  },
  header: {
    gap: THEME.spacing.s,
  },
  backPlaceholder: {
    height: THEME.spacing.xl,
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
  },
  buttons: {
    flex: 1,
    justifyContent: 'center',
    gap: THEME.spacing.l,
  },
});
