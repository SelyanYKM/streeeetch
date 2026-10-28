import * as Haptics from 'expo-haptics';

// Vibrations « fortes » (moteur de vibration Android) : le téléphone est posé au sol,
// une vibration légère ne se sentirait pas.

/** Petit retour sur un appui de bouton. */
export function triggerLightHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

/** Début d'une tenue : un coup franc. */
export function triggerStartHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {}
}

/** Fin d'une tenue : vibration « succès » suivie d'un coup franc, bien distincte du début. */
export function triggerEndHaptic() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
  } catch {}
}
