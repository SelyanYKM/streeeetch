// Avancement du lecteur dans la suite d'étapes, calculé à partir de l'heure réelle
// (Date.now) : on retient l'heure de fin de l'étape en cours plutôt qu'un compteur
// décrémenté par setInterval, qui dériverait (et s'arrêterait écran éteint).

import { Step } from './session';

export interface PlayerPosition {
  // Indice de l'étape en cours ; vaut steps.length quand la séance est finie.
  index: number;
  // Heure (ms, Date.now) à laquelle l'étape en cours se termine.
  endAt: number;
  // En pause : temps restant de l'étape figé (ms). null quand le minuteur tourne.
  pausedRemainingMs: number | null;
  // Temps sauté avec « Passer » (ms), retiré de la durée réellement faite.
  skippedMs: number;
}

export function startPosition(steps: Step[], now: number): PlayerPosition {
  return { index: 0, endAt: now + (steps[0]?.durationSec ?? 0) * 1000, pausedRemainingMs: null, skippedMs: 0 };
}

export function isPaused(position: PlayerPosition): boolean {
  return position.pausedRemainingMs !== null;
}

export function pause(position: PlayerPosition, now: number): PlayerPosition {
  if (isPaused(position)) return position;
  return { ...position, pausedRemainingMs: Math.max(0, position.endAt - now) };
}

export function resume(position: PlayerPosition, now: number): PlayerPosition {
  if (position.pausedRemainingMs === null) return position;
  return { ...position, endAt: now + position.pausedRemainingMs, pausedRemainingMs: null };
}

/** Passe directement à la transition de l'exercice suivant (ou termine la séance). Relance le minuteur. */
export function skipExercise(steps: Step[], position: PlayerPosition, now: number): PlayerPosition {
  const current = steps[position.index];
  if (!current) return position;
  // Sauté = reste de l'étape en cours + étapes restantes du même exercice.
  let skippedMs = position.skippedMs + remainingMs(position, now);
  let index = position.index + 1;
  while (index < steps.length && steps[index].exerciseIndex === current.exerciseIndex) {
    skippedMs += steps[index].durationSec * 1000;
    index += 1;
  }
  return { index, endAt: now + (steps[index]?.durationSec ?? 0) * 1000, pausedRemainingMs: null, skippedMs };
}

export function isFinished(steps: Step[], position: PlayerPosition): boolean {
  return position.index >= steps.length;
}

/**
 * Passe aux étapes suivantes si l'heure de fin est dépassée. Rattrape plusieurs
 * étapes d'un coup si besoin (app restée en arrière-plan). Renvoie le même objet
 * si rien ne change, pour éviter un nouvel affichage inutile.
 */
export function advanceTo(steps: Step[], position: PlayerPosition, now: number): PlayerPosition {
  if (isPaused(position)) return position;
  let { index, endAt } = position;
  while (index < steps.length && now >= endAt) {
    index += 1;
    if (index < steps.length) endAt += steps[index].durationSec * 1000;
  }
  return index === position.index ? position : { ...position, index, endAt };
}

function remainingMs(position: PlayerPosition, now: number): number {
  return Math.max(0, position.pausedRemainingMs ?? position.endAt - now);
}

/** Secondes restantes de l'étape en cours, arrondies au-dessus (affiche 5, 4… 1). */
export function remainingSec(position: PlayerPosition, now: number): number {
  return Math.ceil(remainingMs(position, now) / 1000);
}

/**
 * Durée réellement faite, en secondes : étapes écoulées + partie faite de l'étape en
 * cours, moins ce qui a été sauté. Les pauses ne comptent pas (le minuteur était figé).
 */
export function elapsedSec(steps: Step[], position: PlayerPosition, now: number): number {
  let doneMs = 0;
  for (let i = 0; i < Math.min(position.index, steps.length); i++) doneMs += steps[i].durationSec * 1000;
  const current = steps[position.index];
  if (current) doneMs += current.durationSec * 1000 - remainingMs(position, now);
  return Math.max(0, Math.round((doneMs - position.skippedMs) / 1000));
}
