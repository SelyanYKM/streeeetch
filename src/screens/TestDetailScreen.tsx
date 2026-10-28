import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { BigButton } from '../components/BigButton';
import { deleteFlexibilityResult, getFlexibilityResults, saveFlexibilityResult } from '../database/db';
import { THEME } from '../theme';
import { FlexibilityResult, FlexibilityTest } from '../types';
import { formatDate, formatNumber, parseNumber } from '../utils/format';
import { triggerLightHaptic } from '../utils/haptics';

interface TestDetailScreenProps {
  test: FlexibilityTest;
  onBack: () => void;
}

/** Un test : consigne, saisie d'un nouveau résultat, et liste datée des résultats. */
export function TestDetailScreen({ test, onBack }: TestDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [results, setResults] = useState<FlexibilityResult[]>(() => getFlexibilityResults(test.id));
  const value = parseNumber(input);

  const handleSave = () => {
    if (value === null) return;
    try {
      saveFlexibilityResult(test.id, value, new Date().toISOString());
    } catch (error) {
      console.error('Enregistrement du résultat impossible:', error);
      Alert.alert('Erreur', "Le résultat n'a pas pu être enregistré.");
      return;
    }
    triggerLightHaptic();
    setInput('');
    setResults(getFlexibilityResults(test.id));
  };

  // Appui long sur un résultat : suppression (en cas d'erreur de saisie), après confirmation.
  const handleDelete = (result: FlexibilityResult) => {
    Alert.alert(
      'Supprimer ce résultat ?',
      `${formatNumber(result.value)} ${test.unit} · ${formatDate(result.measuredAt)}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteFlexibilityResult(result.id);
            setResults(getFlexibilityResults(test.id));
          },
        },
      ]
    );
  };

  // Le clavier numérique Android n'a pas toujours de signe moins : bouton pour l'inverser.
  const toggleSign = () => setInput((text) => (text.startsWith('-') ? text.slice(1) : `-${text}`));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + THEME.spacing.m, paddingBottom: insets.bottom + THEME.spacing.xl }}
      keyboardShouldPersistTaps="handled"
    >
      <BackButton onPress={onBack} />
      <Text style={styles.title}>{test.name}</Text>
      <Text style={styles.instruction}>{test.instruction}</Text>
      <Text style={styles.direction}>
        Unité : {test.unit} · {test.betterWhen === 'plus-haut' ? 'plus haut = mieux' : 'plus bas = mieux'}
      </Text>

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.signButton} onPress={toggleSign}>
          <Text style={styles.signText}>+/−</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          keyboardType="numeric"
          placeholder="Résultat"
          placeholderTextColor={THEME.colors.disabled}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
        <Text style={styles.unit}>{test.unit}</Text>
      </View>
      <BigButton label="ENREGISTRER" primary disabled={value === null} onPress={handleSave} />

      <Text style={styles.sectionTitle}>Résultats</Text>
      {results.length === 0 ? (
        <Text style={styles.empty}>Aucun résultat pour l'instant.</Text>
      ) : (
        results.map((result, index) => (
          <TouchableOpacity key={result.id} onLongPress={() => handleDelete(result)} activeOpacity={0.7}>
            <View style={styles.resultRow}>
              <Text style={styles.resultDate}>{formatDate(result.measuredAt)}</Text>
              <View style={styles.resultValues}>
                <Text style={styles.resultValue}>
                  {formatNumber(result.value)} {test.unit}
                </Text>
                <Progress test={test} current={result} previous={results[index + 1]} />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
      {results.length > 0 && <Text style={styles.hint}>Appui long sur un résultat pour le supprimer.</Text>}
    </ScrollView>
  );
}

/** Écart avec le résultat précédent, en vert si c'est mieux, en orange si c'est moins bien. */
function Progress({ test, current, previous }: { test: FlexibilityTest; current: FlexibilityResult; previous?: FlexibilityResult }) {
  if (!previous) return null;
  const diff = current.value - previous.value;
  if (Math.abs(diff) < 0.05) return <Text style={[styles.progress, { color: THEME.colors.textSecondary }]}>=</Text>;
  const better = test.betterWhen === 'plus-haut' ? diff > 0 : diff < 0;
  return (
    <Text style={[styles.progress, { color: better ? THEME.colors.success : THEME.colors.stopped }]}>
      {diff > 0 ? '+' : ''}
      {formatNumber(diff)}
    </Text>
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
  instruction: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.body,
    lineHeight: 28,
    marginTop: THEME.spacing.m,
  },
  direction: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.small,
    marginTop: THEME.spacing.s,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.s,
    marginTop: THEME.spacing.l,
    marginBottom: THEME.spacing.m,
  },
  signButton: {
    height: 72,
    paddingHorizontal: THEME.spacing.m,
    borderRadius: THEME.radius,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
  },
  signText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.body,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    height: 72,
    borderRadius: THEME.radius,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.button,
    fontWeight: '800',
    textAlign: 'center',
  },
  unit: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.body,
    fontWeight: '700',
    minWidth: 32,
  },
  sectionTitle: {
    color: THEME.colors.accent,
    fontSize: THEME.fontSize.small,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: THEME.spacing.xl,
    marginBottom: THEME.spacing.s,
  },
  empty: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.body,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius,
    padding: THEME.spacing.m,
    marginBottom: THEME.spacing.s,
  },
  resultDate: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.small,
  },
  resultValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: THEME.spacing.m,
  },
  resultValue: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.body,
    fontWeight: '800',
  },
  progress: {
    fontSize: THEME.fontSize.small,
    fontWeight: '800',
    minWidth: 48,
    textAlign: 'right',
  },
  hint: {
    color: THEME.colors.disabled,
    fontSize: THEME.fontSize.small,
    textAlign: 'center',
    marginTop: THEME.spacing.s,
  },
});
