import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { BigButton } from '../components/BigButton';
import { getFlexibilityResults } from '../database/db';
import { FLEXIBILITY_TESTS } from '../database/seed';
import { THEME } from '../theme';
import { formatDate, formatNumber } from '../utils/format';

interface TestsScreenProps {
  onSelectTest: (testId: string) => void;
  onBack: () => void;
}

/** Liste des tests de souplesse (définis dans seed.ts), avec le dernier résultat de chacun. */
export function TestsScreen({ onSelectTest, onBack }: TestsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + THEME.spacing.m }]}>
      <BackButton onPress={onBack} />
      <Text style={styles.title}>Tests de souplesse</Text>
      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + THEME.spacing.m }]}>
        {FLEXIBILITY_TESTS.map((test) => {
          const last = getFlexibilityResults(test.id)[0];
          return (
            <BigButton
              key={test.id}
              label={test.name.toUpperCase()}
              sublabel={
                last
                  ? `Dernier : ${formatNumber(last.value)} ${test.unit} · ${formatDate(last.measuredAt)}`
                  : 'Jamais fait'
              }
              onPress={() => onSelectTest(test.id)}
            />
          );
        })}
      </ScrollView>
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
    marginBottom: THEME.spacing.l,
  },
  list: {
    gap: THEME.spacing.l,
  },
});
