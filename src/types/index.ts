// Types partagés de l'app. Le détail de chaque champ (avec exemples) est expliqué
// en haut de src/database/seed.ts.

export type SessionType = 'push' | 'pull' | 'legs';

// Moment de la séance d'étirements par rapport à la séance de muscu.
export type Moment = 'pre' | 'post';

// Durée d'une séance post-workout : courte (5 min) ou longue (10 min = courte + complément).
export type PostLength = 'courte' | 'longue';

export type ExerciseType = 'mobilite' | 'statique';

export type Zone =
  | 'cou'
  | 'epaules'
  | 'pectoraux'
  | 'dos'
  | 'bras'
  | 'poignets'
  | 'colonne'
  | 'hanches'
  | 'fessiers'
  | 'adducteurs'
  | 'quadriceps'
  | 'ischios'
  | 'mollets';

export interface Exercise {
  id: string;
  name: string;
  instruction: string;
  unilateral: boolean;
  zone: Zone;
  type: ExerciseType;
  imageKey: string;
  source?: string;
}

// Une ligne de routine : quel exercice, combien de séries, combien de secondes par tenue.
export interface RoutineItem {
  exerciseId: string;
  sets: number;
  holdSec: number;
}

export interface Routine {
  sessionType: SessionType;
  moment: Moment;
  exercises: RoutineItem[];
  // Exercices ajoutés à la fin pour la version longue du post-workout (vide pour le pré).
  complement: RoutineItem[];
}

export interface FlexibilityTest {
  id: string;
  name: string;
  instruction: string;
  unit: string;
  betterWhen: 'plus-haut' | 'plus-bas';
}
