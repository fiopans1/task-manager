const pad = (value) => String(value).padStart(2, "0");

/**
 * Formats a number of seconds as HH:MM:SS.
 * Hours are not capped at 24 (e.g. 27:15:02).
 */
export function formatDuration(totalSeconds) {
  const numericValue = Number(totalSeconds);
  const safeSeconds = Number.isFinite(numericValue)
    ? Math.max(0, Math.floor(numericValue))
    : 0;

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default formatDuration;
