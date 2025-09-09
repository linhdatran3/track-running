export function toPaceMinPerKm(mps?: number | null) {
  if (!mps || mps <= 0) return null;
  return 1000 / mps / 60;
}
export function fmtPace(minPerKm?: number | null) {
  if (minPerKm == null) return "—";
  const totalSec = Math.round(minPerKm * 60);
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
