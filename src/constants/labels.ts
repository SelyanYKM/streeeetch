import { Moment, PostLength, RoutineMoment, SessionType } from '../types';

export const SESSION_LABELS: Record<SessionType, string> = {
  push: 'PUSH',
  pull: 'PULL',
  legs: 'LEGS',
};

export const MOMENT_LABELS: Record<Moment, string> = {
  pre: 'PRÉ',
  post: 'POST',
};

export const LENGTH_LABELS: Record<PostLength, string> = {
  courte: 'COURTE',
  longue: 'LONGUE',
};

// Libellé complet d'une routine, pour l'historique : « PRÉ », « POST COURTE »…
export const ROUTINE_MOMENT_LABELS: Record<RoutineMoment, string> = {
  pre: 'PRÉ',
  'post-courte': 'POST COURTE',
  'post-longue': 'POST LONGUE',
};
