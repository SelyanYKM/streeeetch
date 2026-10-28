import { ImageSourcePropType } from 'react-native';

// Image affichée pour tout exercice qui n'a pas encore sa propre image.
const PLACEHOLDER = require('../../assets/exercises/placeholder.png');

/*
 * Images des exercices, rangées par clé (le champ imageKey de seed.ts).
 * Pour donner sa vraie image à un exercice :
 *   1. dépose le fichier dans assets/exercises/ (ex. assets/exercises/pigeon.png) ;
 *   2. ajoute une ligne ici :  pigeon: require('../../assets/exercises/pigeon.png'),
 * Tant qu'une clé n'est pas listée, l'exercice affiche l'image provisoire.
 */
const EXERCISE_IMAGES: Record<string, ImageSourcePropType> = {};

export function getExerciseImage(imageKey: string): ImageSourcePropType {
  return EXERCISE_IMAGES[imageKey] ?? PLACEHOLDER;
}
