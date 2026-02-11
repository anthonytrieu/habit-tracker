export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function getDayLabel(dayIndex: number): string {
  return DAY_LABELS[dayIndex] ?? "";
}

export function isScheduledForDay(schedule: number[], date: Date): boolean {
  return schedule.includes(date.getDay());
}

export function getScheduleSummary(schedule: number[]): string {
  if (schedule.length === 7) return "Every day";
  if (
    schedule.length === 5 &&
    [1, 2, 3, 4, 5].every((d) => schedule.includes(d))
  ) {
    return "Weekdays";
  }
  if (
    schedule.length === 2 &&
    [0, 6].every((d) => schedule.includes(d))
  ) {
    return "Weekends";
  }
  const sorted = [...schedule].sort((a, b) => a - b);
  return sorted.map((d) => getDayLabel(d)).join(", ");
}
