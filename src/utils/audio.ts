import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

// Sons embarqués dans l'app : aucune connexion réseau requise à la salle.
const SOUNDS = {
  start: require('../../assets/sounds/exercise_start.wav'),
  end: require('../../assets/sounds/exercise_end.wav'),
};

let players: Record<keyof typeof SOUNDS, AudioPlayer> | null = null;
let isAudioConfigured = false;

/**
 * Configure la session audio pour :
 * 1. Ne PAS couper ni baisser la musique en cours (Spotify, etc.).
 * 2. Jouer les bips par-dessus la musique (mixWithOthers), même en mode silencieux.
 */
export async function configureAppAudio(): Promise<void> {
  if (isAudioConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
    isAudioConfigured = true;
  } catch {
    // Mode dégradé si non supporté : la vibration prend le relais.
  }
}

/** Charge les deux sons à l'avance pour qu'ils partent sans délai. À appeler au démarrage. */
export function preloadSignalSounds(): void {
  if (players) return;
  try {
    players = { start: createAudioPlayer(SOUNDS.start), end: createAudioPlayer(SOUNDS.end) };
  } catch {
    players = null;
  }
}

function play(sound: keyof typeof SOUNDS): void {
  const player = players?.[sound];
  if (!player) return;
  try {
    // Repart du début : le même lecteur sert à chaque exercice.
    player.seekTo(0).finally(() => player.play());
  } catch {
    // Silencieux : la vibration prend le relais.
  }
}

export const playStartSound = () => play('start');
export const playEndSound = () => play('end');
