import * as SQLite from 'expo-sqlite';
import { FlexibilityResult, RoutineMoment, SessionRecord, SessionStatus, SessionType } from '../types';

// Base locale du téléphone : historique des séances et résultats des tests de souplesse.
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
    CREATE TABLE IF NOT EXISTS flexibility_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id TEXT NOT NULL,
      measured_at TEXT NOT NULL,
      value REAL NOT NULL
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

export function saveFlexibilityResult(testId: string, value: number, measuredAt: string): void {
  if (!db) throw new Error('Base non ouverte');
  db.runSync('INSERT INTO flexibility_results (test_id, measured_at, value) VALUES (?, ?, ?);', testId, measuredAt, value);
}

export function deleteFlexibilityResult(id: number): void {
  db?.runSync('DELETE FROM flexibility_results WHERE id = ?;', id);
}

/** Résultats d'un test, le plus récent en haut. */
export function getFlexibilityResults(testId: string): FlexibilityResult[] {
  if (!db) return [];
  const rows = db.getAllSync<{ id: number; test_id: string; measured_at: string; value: number }>(
    'SELECT * FROM flexibility_results WHERE test_id = ? ORDER BY measured_at DESC, id DESC;',
    testId
  );
  return rows.map((r) => ({ id: r.id, testId: r.test_id, measuredAt: r.measured_at, value: r.value }));
}
