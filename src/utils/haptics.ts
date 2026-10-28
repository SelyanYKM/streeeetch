import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';

/** Petit retour sur un appui de bouton (téléphone en main). */
export function triggerLightHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

// Signaux de début et de fin : vibration Android classique, longue et à pleine puissance.
// Les vibrations d'expo-haptics (40-50 ms à faible intensité) ne se sentent pas avec le
// téléphone posé sur le tapis. Motif = [attente, vibration, pause, vibration…] en ms.

/** Début d'une tenue : une vibration franche. */
export function triggerStartHaptic() {
  Vibration.vibrate([0, 400]);
}

/** Fin d'une tenue : trois vibrations, la dernière plus longue, bien distinctes du début. */
export function triggerEndHaptic() {
  Vibration.vibrate([0, 250, 150, 250, 150, 500]);
}
