/** 305 → « 5 min 05 s », 45 → « 45 s », 300 → « 5 min ». */
export function formatDuration(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = Math.round(totalSec % 60);
  if (min === 0) return `${sec} s`;
  if (sec === 0) return `${min} min`;
  return `${min} min ${String(sec).padStart(2, '0')} s`;
}

const DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** Date ISO → « mar. 28 oct. 2026 · 15:20 », à l'heure du téléphone. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${time}`;
}

/** Date ISO → « mar. 28 oct. 2026 », à l'heure du téléphone. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 12.5 → « 12,5 », -3 → « −3 ». Une décimale au plus, virgule française. */
export function formatNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded < 0 ? '−' : ''}${String(Math.abs(rounded)).replace('.', ',')}`;
}

/** Lit un nombre saisi à la main (« 12,5 », « -3 », « 4.0 ») ; null si invalide. */
export function parseNumber(text: string): number | null {
  const cleaned = text.trim().replace(',', '.').replace('−', '-');
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}
