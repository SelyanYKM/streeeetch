// Logique pure de séance (aucun affichage) : transforme une routine en une suite
// d'étapes chronométrées. L'aperçu s'en sert pour la durée totale, le lecteur pour
// enchaîner les étapes : les deux restent donc toujours d'accord.

import { EXERCISES, ROUTINES } from '../database/seed';
import { Exercise, Moment, PostLength, RoutineMoment, SessionType } from '../types';

export const TRANSITION_SEC = 5;

export type Side = 'droite' | 'gauche' | null;

// Une tenue de l'exercice, ou la transition « Prépare-toi » qui la précède.
export interface Step {
  kind: 'transition' | 'hold';
  durationSec: number;
  exercise: Exercise;
  set: number; // 1, 2, 3…
  totalSets: number;
  side: Side; // null pour un exercice non unilatéral
}

// Exercice + réglages de la routine, prêt à afficher ou à dérouler.
export interface PlannedExercise {
  exercise: Exercise;
  sets: number;
  holdSec: number;
}

const EXERCISES_BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

/** Liste les problèmes de seed.ts (identifiants inconnus, routine manquante…), en clair. */
export function findSeedErrors(): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  for (const e of EXERCISES) {
    if (seenIds.has(e.id)) errors.push(`Exercice en double : « ${e.id} »`);
    seenIds.add(e.id);
  }
  const sessionTypes: SessionType[] = ['push', 'pull', 'legs'];
  const moments: RoutineMoment[] = ['pre', 'post-courte', 'post-longue'];
  for (const sessionType of sessionTypes) {
    for (const moment of moments) {
      const count = ROUTINES.filter((r) => r.sessionType === sessionType && r.moment === moment).length;
      if (count !== 1) errors.push(`Il faut exactement 1 routine ${sessionType} ${moment} (trouvé : ${count})`);
    }
  }
  for (const r of ROUTINES) {
    for (const item of r.exercises) {
      if (!EXERCISES_BY_ID.has(item.exerciseId)) {
        errors.push(`Routine ${r.sessionType} ${r.moment} : exercice inconnu « ${item.exerciseId} »`);
      }
      if (!(item.sets >= 1) || (item.holdSec !== undefined && !(item.holdSec >= 1))) {
        errors.push(`Routine ${r.sessionType} ${r.moment} : séries et durée doivent valoir au moins 1 (« ${item.exerciseId} »)`);
      }
    }
  }
  return errors;
}

/** Routine correspondant au choix fait à l'écran (pré, ou post courte / longue). */
function routineMoment(moment: Moment, length: PostLength | null): RoutineMoment {
  if (moment === 'pre') return 'pre';
  return length === 'longue' ? 'post-longue' : 'post-courte';
}

/** Exercices de la séance choisie, dans l'ordre, avec leur durée de tenue effective. */
export function planSession(sessionType: SessionType, moment: Moment, length: PostLength | null): PlannedExercise[] {
  const wanted = routineMoment(moment, length);
  const routine = ROUTINES.find((r) => r.sessionType === sessionType && r.moment === wanted);
  if (!routine) return [];
  return routine.exercises.flatMap((item) => {
    const exercise = EXERCISES_BY_ID.get(item.exerciseId);
    return exercise ? [{ exercise, sets: item.sets, holdSec: item.holdSec ?? exercise.defaultHoldSec }] : [];
  });
}

/**
 * Déroule la séance : séries enchaînées par exercice (A-A-A puis B-B-B), côté droit
 * puis gauche pour un unilatéral, et 5 s de transition avant chaque tenue.
 */
export function buildSteps(plan: PlannedExercise[]): Step[] {
  const steps: Step[] = [];
  for (const { exercise, sets, holdSec } of plan) {
    const sides: Side[] = exercise.unilateral ? ['droite', 'gauche'] : [null];
    for (let set = 1; set <= sets; set++) {
      for (const side of sides) {
        const base = { exercise, set, totalSets: sets, side };
        steps.push({ ...base, kind: 'transition', durationSec: TRANSITION_SEC });
        steps.push({ ...base, kind: 'hold', durationSec: holdSec });
      }
    }
  }
  return steps;
}

export function totalDurationSec(steps: Step[]): number {
  return steps.reduce((sum, s) => sum + s.durationSec, 0);
}

/** Durée totale d'une séance, transitions et deux côtés inclus. */
export function sessionDurationSec(sessionType: SessionType, moment: Moment, length: PostLength | null): number {
  return totalDurationSec(buildSteps(planSession(sessionType, moment, length)));
}
