import { Moment, PostLength, SessionType } from '../types';

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
