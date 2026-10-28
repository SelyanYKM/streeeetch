// Avancement du lecteur dans la suite d'étapes, calculé à partir de l'heure réelle
// (Date.now) : on retient l'heure de fin de l'étape en cours plutôt qu'un compteur
// décrémenté par setInterval, qui dériverait (et s'arrêterait écran éteint).

import { Step } from './session';

export interface PlayerPosition {
  // Indice de l'étape en cours ; vaut steps.length quand la séance est finie.
  index: number;
  // Heure (ms, Date.now) à laquelle l'étape en cours se termine.
  endAt: number;
}

export function startPosition(steps: Step[], now: number): PlayerPosition {
  return { index: 0, endAt: now + (steps[0]?.durationSec ?? 0) * 1000 };
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
  let { index, endAt } = position;
  while (index < steps.length && now >= endAt) {
    index += 1;
    if (index < steps.length) endAt += steps[index].durationSec * 1000;
  }
  return index === position.index ? position : { index, endAt };
}

/** Secondes restantes de l'étape en cours, arrondies au-dessus (affiche 5, 4… 1). */
export function remainingSec(position: PlayerPosition, now: number): number {
  return Math.max(0, Math.ceil((position.endAt - now) / 1000));
}
