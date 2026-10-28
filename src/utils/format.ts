/** 305 → « 5 min 05 s », 45 → « 45 s », 300 → « 5 min ». */
export function formatDuration(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = Math.round(totalSec % 60);
  if (min === 0) return `${sec} s`;
  if (sec === 0) return `${min} min`;
  return `${min} min ${String(sec).padStart(2, '0')} s`;
}
