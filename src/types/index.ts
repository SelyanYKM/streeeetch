// Types partagés de l'app. Le détail de chaque champ (avec exemples) est expliqué
// en haut de src/database/seed.ts.

export type SessionType = 'push' | 'pull' | 'legs';

// Moment de la séance d'étirements par rapport à la séance de muscu.
export type Moment = 'pre' | 'post';

// Durée d'une séance post-workout : courte (5 min) ou longue (10 min).
export type PostLength = 'courte' | 'longue';

// Les 3 routines de chaque séance, toutes indépendantes dans seed.ts.
export type RoutineMoment = 'pre' | 'post-courte' | 'post-longue';

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
  defaultHoldSec: number;
  unilateral: boolean;
  zone: Zone;
  type: ExerciseType;
  imageKey: string;
  source?: string;
}

// Une ligne de routine : quel exercice, combien de séries, et éventuellement une durée
// de tenue propre à cette routine (sinon celle par défaut de l'exercice).
export interface RoutineItem {
  exerciseId: string;
  sets: number;
  holdSec?: number;
}

export interface Routine {
  sessionType: SessionType;
  moment: RoutineMoment;
  exercises: RoutineItem[];
}

export interface FlexibilityTest {
  id: string;
  name: string;
  instruction: string;
  unit: string;
  betterWhen: 'plus-haut' | 'plus-bas';
}

export type SessionStatus = 'terminee' | 'arretee';

// Une séance enregistrée dans l'historique.
export interface SessionRecord {
  id: number;
  startedAt: string; // date et heure de début, format ISO
  sessionType: SessionType;
  moment: RoutineMoment;
  durationSec: number; // durée réellement faite (sans les pauses ni les exercices passés)
  status: SessionStatus;
}
