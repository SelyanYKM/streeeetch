import * as SQLite from 'expo-sqlite';
import { RoutineMoment, SessionRecord, SessionStatus, SessionType } from '../types';

// Base locale du téléphone : historique des séances (et, à l'étape 6, résultats des tests).
// Les exercices et routines, eux, restent dans seed.ts.

let db: SQLite.SQLiteDatabase | null = null;

export function initDatabase(): void {
  db = SQLite.openDatabaseSync('streeeetch.db');
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      session_type TEXT NOT NULL,
      moment TEXT NOT NULL,
      duration_sec INTEGER NOT NULL,
      status TEXT NOT NULL
    );
  `);
}

export function saveSession(session: Omit<SessionRecord, 'id'>): void {
  if (!db) return;
  db.runSync(
    'INSERT INTO sessions (started_at, session_type, moment, duration_sec, status) VALUES (?, ?, ?, ?, ?);',
    session.startedAt,
    session.sessionType,
    session.moment,
    session.durationSec,
    session.status
  );
}

/** Toutes les séances, la plus récente en haut. */
export function getSessions(): SessionRecord[] {
  if (!db) return [];
  const rows = db.getAllSync<{
    id: number;
    started_at: string;
    session_type: SessionType;
    moment: RoutineMoment;
    duration_sec: number;
    status: SessionStatus;
  }>('SELECT * FROM sessions ORDER BY started_at DESC, id DESC;');
  return rows.map((r) => ({
    id: r.id,
    startedAt: r.started_at,
    sessionType: r.session_type,
    moment: r.moment,
    durationSec: r.duration_sec,
    status: r.status,
  }));
}
